import { Request, Response } from "express";
import {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeGuestCartIntoUserCart,
} from "../services/cart.service";

// helper: unify user/session extraction
const getContext = (req: Request) => {
  return {
    userId: (req as any).user?.userId || undefined,
    sessionId: req.headers["x-session-id"] as string | undefined,
  };
};


export const getCartController = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = getContext(req);

    

    if (!userId && !sessionId) {
      return res.status(400).json({ message: "Session ID required" });
    }

    const cart = await getOrCreateCart({ userId, sessionId });

    return res.json(cart);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to fetch cart" });
  }
};


export const addToCartController = async (req: Request, res: Response) => {
    console.log("Auth Header Postman Sent:", req.headers.authorization);
  console.log("Decoded User:", (req as any).user);
  try {
    const { userId, sessionId } = getContext(req);
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "productId and quantity required" });
    }

    const item = await addToCart(productId, quantity, sessionId, userId);

    return res.status(201).json(item);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to add item" });
  }
};


export const updateCartItemController = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = getContext(req);
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    const item = await updateCartItem(productId, quantity, sessionId, userId);

    return res.json(item);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to update item" });
  }
};


export const removeCartItemController = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = getContext(req);
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    await removeCartItem(productId, sessionId, userId);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to remove item" });
  }
};


export const mergeCartController = async (req: Request, res: Response) => {
  try {
    const { userId, sessionId } = getContext(req);

    console.log("req.user:", (req as any).user);
    console.log("headers:", req.headers);
    console.log({
  userId,
  sessionId,
  });
    if (!userId || !sessionId) {
      return res.status(400).json({ message: "userId and sessionId required" });
    }

    await mergeGuestCartIntoUserCart(sessionId, userId);

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Merge failed" });
  }
};