import z from "zod";

export const signUpSchema=z.object({
    name:z.string().min(3),
    email:z.string().email(),
    password:z
    .string()
    .min(8)
    .regex(/[A-Z]/, "must contain at least one uppercase letter") 
    .regex(/[0-9]/, "must contain at least one digit")
})

export const signInSchema=z.object({
    email:z.string().email(),
    password:z.string().min(8)
})
export const forgetPasswordSchema=z.object({
    email:z.string().email()
})
export const verifyResetTokenSchema=z.object({
    email:z.string().email(),
    token:z.string()
})
export const resetPasswordSchema=z.object({
    email:z.string().email(),
    password:z
    .string()
    .min(8)
    .regex(/[A-Z]/, "must contain at least one uppercase letter") 
    .regex(/[0-9]/, "must contain at least one digit")
})