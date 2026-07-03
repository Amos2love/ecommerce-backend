import { Request, Response, NextFunction } from "express";

import { prisma } from "../lib/prisma";

export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    if (!req.user) {

      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
    });

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found",
      });

    }

    if (user.role !== "ADMIN") {

      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });

    }

    next();

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });

  }

};