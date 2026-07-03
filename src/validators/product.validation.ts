import { z } from "zod";

export const createProductSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  description: z
    .string()
    .min(10, "Description too short"),

  price: z.coerce
    .number()
    .positive("Price must be positive"),

  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock cannot be negative")

});

export const updateProductSchema =
  createProductSchema.partial();

export type CreateProductInput =
  z.infer<typeof createProductSchema>;

export type UpdateProductInput =
  z.infer<typeof updateProductSchema>;