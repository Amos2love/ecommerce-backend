"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.getUserOrders = getUserOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.softDeleteOrder = softDeleteOrder;
const prisma_1 = require("../lib/prisma");
async function createOrder(userId, shippingDetails, paymentMethod) {
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Get user's cart and products
        const cart = await tx.cart.findUnique({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw new Error("Cannot create an order with an empty cart.");
        }
        const dbCartItems = cart.items;
        // Calculate totals using database prices
        const subtotal = dbCartItems.reduce((sum, item) => sum + item.quantity * Number(item.product.price), 0);
        const tax = subtotal * 0.08;
        const shippingFee = 15;
        const discount = 0;
        const total = subtotal + tax + shippingFee - discount;
        // Create order and order items
        const newOrder = await tx.order.create({
            data: {
                userId,
                status: "PENDING",
                subtotal,
                tax,
                shippingFee,
                discount,
                total,
                paymentMethod,
                shippingName: shippingDetails.shippingName,
                shippingAddress: shippingDetails.shippingAddress,
                shippingCity: shippingDetails.shippingCity,
                shippingCountry: shippingDetails.shippingCountry,
                items: {
                    create: dbCartItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        // Clear cart after successful order creation
        await tx.cartItem.deleteMany({
            where: {
                cartId: cart.id,
            },
        });
        return newOrder;
    });
}
async function getOrderById(orderId, userId) {
    const order = await prisma_1.prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
    if (!order || order.deletedAt) {
        throw new Error("Order not found");
    }
    if (userId && order.userId !== userId) {
        throw new Error("Unauthorized access to order");
    }
    return order;
}
async function getUserOrders(userId) {
    return await prisma_1.prisma.order.findMany({
        where: {
            userId,
            deletedAt: null,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
    });
}
async function updateOrderStatus(orderId, status, transactionId, trackingNumber) {
    return await prisma_1.prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            status,
            ...(transactionId && { transactionId }),
            ...(trackingNumber && { trackingNumber }),
        },
    });
}
async function softDeleteOrder(orderId) {
    return await prisma_1.prisma.order.update({
        where: {
            id: orderId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
