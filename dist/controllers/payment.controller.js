"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterwaveWebhookController = exports.initiateCheckoutController = void 0;
const payment_service_1 = require("../services/payment.service");
const order_service_1 = require("../services/order.service");
// --- 1. THE CHECKOUT CONTROLLER ---
const initiateCheckoutController = async (req, res) => {
    try {
        const { orderId } = req.params;
        // Fetch order from DB to prevent users from manipulating the price
        const order = await (0, order_service_1.getOrderById)(orderId);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (order.status !== "PENDING")
            return res.status(400).json({ message: "Order already processed" });
        // Ask the Service layer for the link
        const checkoutUrl = await (0, payment_service_1.initializeFlutterwavePayment)(order.id, Number(order.total), "customer@example.com", // In a real app: order.user.email1
        order.shippingName);
        return res.status(200).json({ success: true, checkoutUrl });
    }
    catch (error) {
        return res.status(500).json({ message: "Failed to initiate checkout" });
    }
};
exports.initiateCheckoutController = initiateCheckoutController;
// --- 2. THE WEBHOOK CONTROLLER ---
const flutterwaveWebhookController = async (req, res) => {
    try {
        // Security check: Make sure this request is actually from Flutterwave
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];
        if (!signature || signature !== secretHash) {
            return res.status(401).json({ message: "Unauthorized webhook" });
        }
        const payload = req.body;
        // If payment was successful, update the database
        if (payload.event === "charge.completed" && payload.data.status === "successful") {
            const orderId = payload.data.tx_ref;
            const transactionId = payload.data.id.toString();
            await (0, order_service_1.updateOrderStatus)(orderId, "PAID", transactionId);
            console.log(`✅ Order ${orderId} marked as PAID`);
        }
        // Always acknowledge receipt to Flutterwave
        return res.status(200).end();
    }
    catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).end();
    }
};
exports.flutterwaveWebhookController = flutterwaveWebhookController;
