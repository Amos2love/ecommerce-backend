import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client"
import redis  from "../utils/redis";

export interface NormalizedProduct {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string; // Add whatever your UI strictly requires
}

export interface NormalizedCartItem {
  productId: string;
  quantity: number;
  price: number;
  lineTotal: number;
  product: NormalizedProduct; // <-- Both Redis and Prisma must supply this now
}

export interface NormalizedCart {
  id: string | null; // null for guests, string for authenticated users
  items: NormalizedCartItem[];
  subtotal: number;
  total: number;
}

const CART_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;


export const getOrCreateCart = async (params: {
  userId?: string;
  sessionId?: string;
}): Promise<NormalizedCart> => { // <-- Force the return type
  const { userId, sessionId } = params;

  if (!userId && !sessionId) {
    throw new Error("Session ID required");
  }

  // ==========================================
  // PATH A: UNAUTHENTICATED GUEST (REDIS)
  // ==========================================
  if (!userId) {
    const guestKey = `cart:guest:${sessionId}`;
    const cachedGuestCart = await redis.get(guestKey);
    
    if (cachedGuestCart) {
      try {
        return JSON.parse(cachedGuestCart) as NormalizedCart;
      } catch (e) {
        console.error("Failed to parse guest cart from Redis", e);
        // Fallthrough to return empty cart if corrupted
      }
    }

    return {
      id: null,
      items: [],
      subtotal: 0,
      total: 0,
    };
  }

  // ==========================================
  // PATH B: AUTHENTICATED USER (PRISMA + REDIS CACHE)
  // ==========================================
  const userKey = `cart:user:${userId}`;
  const cachedUserCart = await redis.get(userKey);
  
  if (cachedUserCart) {
    try {
      return JSON.parse(cachedUserCart) as NormalizedCart;
    } catch (e) {
      console.error("Failed to parse user cart from Redis", e);
    }
  }

  // Cache Miss: Fetch from DB
  const dbCart = await prisma.cart.upsert({
    where: { userId: userId }, 
    update: {}, 
    create: { userId: userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  // MAP THE DATABASE RESULT TO THE NORMALIZED SHAPE
  const normalizedCart: NormalizedCart = {
    id: dbCart.id,
    items: dbCart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.price),
      lineTotal: Number(item.lineTotal),
      product: {
        id: item.product.id,
        title: item.product.title,
        description: item.product.description,
        imageUrl: item.product.imageUrl,
      },
    })),
    subtotal: Number(dbCart.subtotal),
    total: Number(dbCart.total),
  };

  // Cache the NORMALIZED cart, not the raw Prisma cart
  await redis.set(userKey, JSON.stringify(normalizedCart), {
    EX:60 * 60
  });

  return normalizedCart;
};


export const addToCart = async (
  // cartId: string | null,
  productId: string,
  quantity: number,
  sessionId?: string,
  userId?: string
): Promise<NormalizedCartItem> => { // <-- 1. Enforce a consistent return type
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  // ==========================================
  // PATH A: GUEST USER (REDIS ONLY)
  // ==========================================
  if (!userId && sessionId) {
    // 1. Fetch product from DB to get pricing AND the data snapshot
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    
    if (!product) {
      throw new Error("Product not found");
    }

    if (quantity>product.stock){
      throw new Error(
      `Only ${product.stock} item(s) available in stock`
    );
    }

    const guestKey = `cart:guest:${sessionId}`;
    const cachedCart = await redis.get(guestKey);

    // 2. Parse existing cart OR initialize a brand new one (Using Normalized Form)
    let cart: NormalizedCart = cachedCart
      ? JSON.parse(cachedCart)
      : { id: null, items: [], subtotal: 0, total: 0 };

    // 3. Upsert logic for Redis (Check if item already exists)
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId === productId
    );

    let addedOrUpdatedItem: NormalizedCartItem;

    if (existingItemIndex > -1) {
      const newQuantity =cart.items[existingItemIndex].quantity + quantity;
    if (newQuantity > product.stock) {
    throw new Error(
      `Only ${product.stock} item(s) available in stock`
    );
    }
  
      
      // Item exists: Increment quantity and lineTotal
      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].lineTotal += (Number(product.price) * newQuantity);
      cart.items[existingItemIndex].price = Number(product.price); 
      
      addedOrUpdatedItem = cart.items[existingItemIndex];
    } else {
      // 4. NEW ITEM: Add to array and inject the PRODUCT SNAPSHOT
      addedOrUpdatedItem = {
        productId,
        quantity,
        price: Number(product.price),
        lineTotal: Number(product.price) * quantity,
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          imageUrl: product.imageUrl,
        },
      };
      cart.items.push(addedOrUpdatedItem);
    }

    // 5. Recalculate guest cart totals inline (or use your helper)
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);
    cart.total = cart.subtotal;

    // 6. Save back to Redis (7-day expiration)
    await redis.set(guestKey, JSON.stringify(cart), {
      EX: CART_EXPIRATION_SECONDS, 
    });

    return addedOrUpdatedItem; // Returns NormalizedCartItem
  }
  
  // ==========================================
  // PATH B: AUTHENTICATED USER (DATABASE)
  // ==========================================
  if (userId) { 
    const cartItem = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId: userId },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const cartId = cart.id;

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (quantity>product.stock){
      throw new Error(
      `Only ${product.stock} item(s) available in stock`
    );
  }

      // Upsert cart item
      const item = await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
        update: {
          quantity: {
            increment: quantity,
          },
          price: product.price,
          lineTotal: {
            increment: Number(product.price) * quantity,
          },
        },
        create: {
          cartId,
          productId,
          quantity,
          price: product.price,
          lineTotal: Number(product.price) * quantity,
        },
        // 7. CRITICAL: Include the product here so we can map it to our Normalized shape
        include: {
          product: true, 
        }
      });

      // Recalculate cart totals using your Prisma helper
      await recalcCart(tx, cartId);

      return item;
    });

    // 8. CACHE INVALIDATION: Clear auth cache
    await redis.del(`cart:user:${userId}`);

    // 9. Map the raw Prisma result to the exact same Normalized DTO
    return {
      productId: cartItem.productId,
      quantity: cartItem.quantity,
      price: Number(cartItem.price),
      lineTotal: Number(cartItem.lineTotal),
      product: {
        id: cartItem.product.id,
        title: cartItem.product.title,
        description: cartItem.product.description,
        imageUrl: cartItem.product.imageUrl,
      },
    };
  }

  throw new Error("Must provide either a userId or a sessionId");
};



export const updateCartItem = async (
  productId: string,
  quantity: number,
  sessionId?: string,
  userId?: string
): Promise<NormalizedCartItem | null> => { // <-- 1. Enforce consistent return type
  // ==========================================
  // PATH A: GUEST USER (REDIS ONLY)
  // ==========================================
  if (!userId && sessionId) {
    const guestKey = `cart:guest:${sessionId}`;
    const cachedCart = await redis.get(guestKey);

    if (!cachedCart) {
      throw new Error("Guest cart not found");
    }

    // 2. Typecast to our new interface
    let cart: NormalizedCart = JSON.parse(cachedCart);

    if (quantity <= 0) {
      cart.items = cart.items.filter((item) => item.productId !== productId);
    } else {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (quantity>product.stock){
      throw new Error(
      `Only ${product.stock} item(s) available in stock`
    );
  }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId === productId
      );

      if (existingItemIndex === -1) {
        throw new Error("Cart item not found in guest cart");
      }

      cart.items[existingItemIndex] = {
        ...cart.items[existingItemIndex],
        quantity,
        price: Number(product.price),
        lineTotal: quantity * Number(product.price),
      };
    }

    cart = recalcRedisCart(cart);

    await redis.set(guestKey, JSON.stringify(cart), {
      EX: CART_EXPIRATION_SECONDS, 
    });

    // Returns a NormalizedCartItem or null
    return quantity <= 0
      ? null
      : cart.items.find((item) => item.productId === productId) || null;
  }

  // ==========================================
  // PATH B: AUTHENTICATED USER (DATABASE)
  // ==========================================
  if ( userId) { 
    const result = await prisma.$transaction(async (tx) => {

      const cart = await tx.cart.findUnique({
        where: { userId: userId }, 
      });

      if (!cart) {
        throw new Error("Cart not found. Call getOrCreateCart first.");
      }

      const cartId = cart.id;

      if (quantity <= 0) {
        await tx.cartItem.delete({
          where: {
            cartId_productId: {
              cartId,
              productId,
            },
          },
        });

        await recalcCart(tx, cartId);
        return null;
      }

      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (quantity>product.stock){
      throw new Error(
      `Only ${product.stock} item(s) available in stock`
    );
  }

      const existing = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });

      if (!existing) {
        throw new Error("Cart item not found");
      }

      // 3. Update item and INCLUDE the product data
      const updatedItem = await tx.cartItem.update({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
        data: {
          quantity,
          price: product.price,
          lineTotal: quantity * Number(product.price),
        },
        include: {
          product: true, // <-- CRITICAL: Fetch the product details
        }
      });

      await recalcCart(tx, cartId);

      return updatedItem;
    });

    // Clear the cache
    await redis.del(`cart:user:${userId}`);

    // If we deleted the item, just return null
    if (!result) return null;

    // 4. Map the raw Prisma result to the exact same Normalized DTO
    return {
      productId: result.productId,
      quantity: result.quantity,
      price: Number(result.price),
      lineTotal: Number(result.lineTotal),
      product: {
        id: result.product.id,
        title: result.product.title,
        description: result.product.description,
        imageUrl: result.product.imageUrl,
      },
    };
  }

  throw new Error("Must provide either a userId or a sessionId");
};



export const recalcRedisCart = (cart:NormalizedCart):NormalizedCart => {
  cart.subtotal = cart.items.reduce(
    (sum: number, item: NormalizedCartItem) => sum + item.lineTotal,
    0
  );
  cart.total = cart.subtotal; // Add tax or shipping logic here later if needed
  return cart;
};



export const removeCartItem = async (
  // cartId: string | null,
  productId: string,
  sessionId?: string,
  userId?: string // <-- ADDED: Required for Auth cache invalidation
) => {
  // ==========================================
  // PATH A: GUEST USER (REDIS ONLY)
  // ==========================================
  if (!userId && sessionId) {
    const guestKey = `cart:guest:${sessionId}`;
    const cachedCart = await redis.get(guestKey);

    if (!cachedCart) {
      throw new Error("Guest cart not found");
    }

    let cart: NormalizedCart = JSON.parse(cachedCart);

    // 1. Remove the item from the array (Strictly Typed)
    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId !== productId);

    if (cart.items.length === initialLength) {
      throw new Error("Cart item not found in guest cart");
    }


    cart = recalcRedisCart(cart);

    // 3. Save the updated cart back to Redis
    await redis.set(guestKey, JSON.stringify(cart), {
      EX: CART_EXPIRATION_SECONDS, 
    });

    return; 
  }

  if (userId) { 


    await prisma.$transaction(async (tx) => {
       const cart = await tx.cart.findUnique({
        where: { userId: userId },
      });

      if (!cart) {
        throw new Error("Cart not found");
      }

      const cartId = cart.id;

      const item = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });

      if (!item) {
        throw new Error("Cart item not found");
      }

      // 2. Delete the item
      await tx.cartItem.delete({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });

      // 3. Recalculate cart totals using your Prisma helper
      await recalcCart(tx, cartId);
    });

    await redis.del(`cart:user:${userId}`);

    return;
  }
  throw new Error("Must provide either a userId or a sessionId");
};


export const mergeGuestCartIntoUserCart = async (
  sessionId: string,
  userId: string
) => {
  const redisKey = `cart:guest:${sessionId}`;
  const cachedCart = await redis.get(redisKey);

  // 1. Exit early if there's nothing to merge
  if (!cachedCart) return;

  const guestCart : NormalizedCart = JSON.parse(cachedCart);
  if (!guestCart.items || guestCart.items.length === 0) {
  await redis.del(redisKey);
  return;
}

  // 2. Perform the heavy lifting inside a secure Database Transaction
  await prisma.$transaction(async (tx) => {
    
    // Step A: Ensure the logged-in user actually has a database cart
    const userCart = await tx.cart.upsert({
      where: { userId: userId },
      update: {},
      create: { userId: userId },
    });

    // Step B: Loop through Redis items and upsert them
  for (const item of guestCart.items) {
  // Get current product from DB
  const product = await tx.product.findUnique({
    where: {
      id: item.productId,
    },
    select: {
      id: true,
      price: true,
    },
  });

  // Skip deleted products
  if (!product) continue;

  const currentPrice = product.price;

const existingItem = await tx.cartItem.findUnique({
  where: {
    cartId_productId: {
      cartId: userCart.id,
      productId: item.productId,
    },
  },
});

if (existingItem) {
  const newQuantity = existingItem.quantity + item.quantity;

  await tx.cartItem.update({
    where: {
      cartId_productId: {
        cartId: userCart.id,
        productId: item.productId,
      },
    },
    data: {
      quantity: newQuantity,
      price: currentPrice,
      lineTotal: newQuantity * currentPrice,
    },
  });
} else {
  await tx.cartItem.create({
    data: {
      cartId: userCart.id,
      productId: item.productId,
      quantity: item.quantity,
      price: currentPrice,
      lineTotal: item.quantity * currentPrice,
    },
  });
}
  }

   await recalcCart(tx, userCart.id); 
  });
// Step C: Call your exact recalculation function!
    
  // 3. Cleanup: Destroy the Redis cart
  await redis.del(redisKey);
  await redis.del(`cart:user:${userId}`);
};

const recalcCart = async (
  tx: Prisma.TransactionClient,
  cartId: string
) => {
  const items = await tx.cartItem.findMany({
    where: { cartId },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0
  );

  await tx.cart.update({
    where: { id: cartId },
    data: {
      subtotal,
      total: subtotal,
    },
  });
};