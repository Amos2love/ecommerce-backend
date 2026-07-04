"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const OrderRouter = (0, express_1.Router)();
OrderRouter.post("/", auth_middleware_1.authMiddleware, order_controller_1.createOrderController);
OrderRouter.get("/user/:userId", auth_middleware_1.authMiddleware, order_controller_1.getUserOrdersController);
OrderRouter.get("/:id", auth_middleware_1.authMiddleware, order_controller_1.getSingleOrderController);
OrderRouter.patch("/:id/status", auth_middleware_1.authMiddleware, order_controller_1.updateOrderStatusController);
OrderRouter.delete("/:id", auth_middleware_1.authMiddleware, order_controller_1.deleteOrderController);
exports.default = OrderRouter;
/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order creation and management
 */
/**
 * @swagger
 * /api/order:
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from the current cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingName:
 *                 type: string
 *               shippingAddress:
 *                 type: string
 *               shippingCity:
 *                 type: string
 *               shippingCountry:
 *                 type: string
 *             required: [shippingName, shippingAddress, shippingCity, shippingCountry]
 *     responses:
 *       201:
 *         description: Order created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/order/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get a single order by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/order/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Update order status (admin or payment webhook)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED]
 *             required: [status]
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @swagger
 * /api/order/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Delete an order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Order deleted
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */ 
