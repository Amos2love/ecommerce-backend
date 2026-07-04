"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(3, "Title must be at least 3 characters"),
    description: zod_1.z
        .string()
        .min(10, "Description too short"),
    price: zod_1.z.coerce
        .number()
        .positive("Price must be positive"),
    stock: zod_1.z.coerce
        .number()
        .int()
        .nonnegative("Stock cannot be negative")
});
exports.updateProductSchema = exports.createProductSchema.partial();
