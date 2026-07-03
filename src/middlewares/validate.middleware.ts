import { Response,Request,NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema:ZodObject<any>) => {
    return (req:Request,res:Response,next:NextFunction) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.flatten() });
        }
        next();
    };
};
