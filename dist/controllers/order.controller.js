"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderController = exports.updateOrderStatusController = exports.getSingleOrderController = exports.getUserOrdersController = exports.createOrderController = void 0;
const order_service_1 = require("../services/order.service");
const createOrderController = async (req, res) => {
    try {
        const { userId, shippingDetails, paymentMethod } = req.body;
        if (!userId || !shippingDetails) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields for checkout",
            });
        }
        const newOrder = await (0, order_service_1.createOrder)(userId, shippingDetails, paymentMethod);
        return res.status(201).json({
            success: true,
            order: newOrder,
        });
    }
    catch (error) {
        console.error("Create Order Error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to create order",
        });
    }
};
exports.createOrderController = createOrderController;
const getUserOrdersController = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }
        const orders = await (0, order_service_1.getUserOrders)(userId);
        return res.status(200).json({
            success: true,
            orders,
        });
    }
    catch (error) {
        console.error("Fetch User Orders Error:", error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to fetch user orders",
        });
    }
};
exports.getUserOrdersController = getUserOrdersController;
const getSingleOrderController = async (req, res) => {
    try {
        const order = await (0, order_service_1.getOrderById)(req.params.id);
        return res.status(200).json({
            success: true,
            order,
        });
    }
    catch (error) {
        console.error("Get Single Order Error:", error);
        const message = error instanceof Error
            ? error.message
            : "Failed to fetch order details";
        const statusCode = message === "Order not found"
            ? 404
            : message === "Unauthorized access to order"
                ? 403
                : 500;
        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
exports.getSingleOrderController = getSingleOrderController;
const updateOrderStatusController = async (req, res) => {
    try {
        const status = req.body.status;
        const { transactionId, trackingNumber } = req.body;
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required to update order",
            });
        }
        const updatedOrder = await (0, order_service_1.updateOrderStatus)(req.params.id, status, transactionId, trackingNumber);
        return res.status(200).json({
            success: true,
            order: updatedOrder,
        });
    }
    catch (error) {
        console.error("Update Order Status Error:", error);
        return res.status(400).json({
            success: false,
            message: error instanceof Error
                ? error.message
                : "Failed to update order status",
        });
    }
};
exports.updateOrderStatusController = updateOrderStatusController;
const deleteOrderController = async (req, res) => {
    try {
        await (0, order_service_1.getOrderById)(req.params.id);
        await (0, order_service_1.softDeleteOrder)(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Order was successfully deleted (hidden)",
        });
    }
    catch (error) {
        console.error("Delete Order Error:", error);
        const message = error instanceof Error
            ? error.message
            : "Failed to delete order";
        const statusCode = message === "Order not found"
            ? 404
            : 500;
        return res.status(statusCode).json({
            success: false,
            message,
        });
    }
};
exports.deleteOrderController = deleteOrderController;
