"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeCartController = exports.removeCartItemController = exports.updateCartItemController = exports.addToCartController = exports.getCartController = void 0;
const cart_service_1 = require("../services/cart.service");
// helper: unify user/session extraction
const getContext = (req) => {
    const rawSessionId = req.headers["x-session-id"];
    const sessionId = Array.isArray(rawSessionId)
        ? rawSessionId[0]
        : rawSessionId;
    return {
        userId: req.user?.userId || undefined,
        sessionId,
    };
};
const getCartController = async (req, res) => {
    try {
        const { userId, sessionId } = getContext(req);
        if (!userId && !sessionId) {
            return res.status(400).json({ message: "Session ID required" });
        }
        const cart = await (0, cart_service_1.getOrCreateCart)({ userId, sessionId });
        return res.json(cart);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to fetch cart" });
    }
};
exports.getCartController = getCartController;
const addToCartController = async (req, res) => {
    console.log("Auth Header Postman Sent:", req.headers.authorization);
    console.log("Decoded User:", req.user);
    try {
        const { userId, sessionId } = getContext(req);
        const { productId, quantity } = req.body;
        if (!productId || !quantity) {
            return res.status(400).json({ message: "productId and quantity required" });
        }
        const item = await (0, cart_service_1.addToCart)(productId, quantity, sessionId, userId);
        return res.status(201).json(item);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to add item" });
    }
};
exports.addToCartController = addToCartController;
const updateCartItemController = async (req, res) => {
    try {
        const { userId, sessionId } = getContext(req);
        const normalizedSessionId = typeof sessionId === "string" ? sessionId : undefined;
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!productId) {
            return res.status(400).json({ message: "productId required" });
        }
        const item = await (0, cart_service_1.updateCartItem)(productId, quantity, normalizedSessionId, userId);
        return res.json(item);
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to update item" });
    }
};
exports.updateCartItemController = updateCartItemController;
const removeCartItemController = async (req, res) => {
    try {
        const { userId, sessionId } = getContext(req);
        const normalizedSessionId = typeof sessionId === "string" ? sessionId : undefined;
        const { productId } = req.params;
        if (!productId) {
            return res.status(400).json({ message: "productId required" });
        }
        await (0, cart_service_1.removeCartItem)(productId, normalizedSessionId, userId);
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Failed to remove item" });
    }
};
exports.removeCartItemController = removeCartItemController;
const mergeCartController = async (req, res) => {
    try {
        const { userId, sessionId } = getContext(req);
        console.log("req.user:", req.user);
        console.log("headers:", req.headers);
        console.log({
            userId,
            sessionId,
        });
        if (!userId || !sessionId) {
            return res.status(400).json({ message: "userId and sessionId required" });
        }
        await (0, cart_service_1.mergeGuestCartIntoUserCart)(sessionId, userId);
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ message: err.message || "Merge failed" });
    }
};
exports.mergeCartController = mergeCartController;
