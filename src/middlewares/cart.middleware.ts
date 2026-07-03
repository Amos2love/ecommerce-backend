import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const cartMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); 
    }
    // if token available
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!
    );

    // Attach user to request
    (req as any).user = decoded;

    // Continue to the controller
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};