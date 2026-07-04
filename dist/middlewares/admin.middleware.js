"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMiddleware = void 0;
const prisma_1 = require("../lib/prisma");
const adminMiddleware = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
exports.adminMiddleware = adminMiddleware;
