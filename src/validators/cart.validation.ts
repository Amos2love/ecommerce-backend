import { z } from "zod";

/**
 * Add to Cart
 */
export const addToCartSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than 0"),
});

/**
 * Update Cart Item
 * (0 quantity = removal allowed)
 */
export const updateCartItemSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required"),

  quantity: z
    .number()
    .int("Quantity must be an integer")
    .nonnegative("Quantity cannot be negative"),
});

/**
 * Remove Cart Item
 */
export const removeCartItemSchema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required"),
});

/**
 * Merge cart (guest → user)
 */
export const mergeCartSchema = z.object({
  sessionId: z
    .string()
    .min(1, "Session ID required"),

  userId: z
    .string()
    .min(1, "User ID required"),
});

/**
 * Optional: cart context validator (useful for middleware)
 */
export const cartContextSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
}).refine(
  (data) => data.userId || data.sessionId,
  {
    message: "Either userId or sessionId must be provided",
  }
);

/**
 * Types
 */
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveCartItemInput = z.infer<typeof removeCartItemSchema>;
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
export type CartContextInput = z.infer<typeof cartContextSchema>;