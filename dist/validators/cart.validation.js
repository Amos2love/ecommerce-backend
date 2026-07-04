"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartContextSchema = exports.mergeCartSchema = exports.removeCartItemSchema = exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
/**
 * Add to Cart
 */
exports.addToCartSchema = zod_1.z.object({
    productId: zod_1.z
        .string()
        .min(1, "Product ID is required"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .positive("Quantity must be greater than 0"),
});
/**
 * Update Cart Item
 * (0 quantity = removal allowed)
 */
exports.updateCartItemSchema = zod_1.z.object({
    productId: zod_1.z
        .string()
        .min(1, "Product ID is required"),
    quantity: zod_1.z
        .number()
        .int("Quantity must be an integer")
        .nonnegative("Quantity cannot be negative"),
});
/**
 * Remove Cart Item
 */
exports.removeCartItemSchema = zod_1.z.object({
    productId: zod_1.z
        .string()
        .min(1, "Product ID is required"),
});
/**
 * Merge cart (guest → user)
 */
exports.mergeCartSchema = zod_1.z.object({
    sessionId: zod_1.z
        .string()
        .min(1, "Session ID required"),
    userId: zod_1.z
        .string()
        .min(1, "User ID required"),
});
/**
 * Optional: cart context validator (useful for middleware)
 */
exports.cartContextSchema = zod_1.z.object({
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
}).refine((data) => data.userId || data.sessionId, {
    message: "Either userId or sessionId must be provided",
});
