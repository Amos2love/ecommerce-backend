"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.verifyResetTokenSchema = exports.forgetPasswordSchema = exports.signInSchema = exports.signUpSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signUpSchema = zod_1.default.object({
    name: zod_1.default.string().min(3),
    email: zod_1.default.string().email(),
    password: zod_1.default
        .string()
        .min(8)
        .regex(/[A-Z]/, "must contain at least one uppercase letter")
        .regex(/[0-9]/, "must contain at least one digit")
});
exports.signInSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default.string().min(8)
});
exports.forgetPasswordSchema = zod_1.default.object({
    email: zod_1.default.string().email()
});
exports.verifyResetTokenSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    token: zod_1.default.string()
});
exports.resetPasswordSchema = zod_1.default.object({
    email: zod_1.default.string().email(),
    password: zod_1.default
        .string()
        .min(8)
        .regex(/[A-Z]/, "must contain at least one uppercase letter")
        .regex(/[0-9]/, "must contain at least one digit")
});
