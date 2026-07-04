"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cartMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }
        // if token available
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        // Attach user to request
        req.user = decoded;
        // Continue to the controller
        next();
    }
    catch (error) {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
};
exports.cartMiddleware = cartMiddleware;
