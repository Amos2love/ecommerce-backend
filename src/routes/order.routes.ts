import { Router } from "express";

import {
  createOrderController,
  getUserOrdersController,
  getSingleOrderController,
  updateOrderStatusController,
  deleteOrderController,
} from "../controllers/order.controller";

import { authMiddleware } from "../middlewares/auth.middleware";

const OrderRouter = Router();

OrderRouter.post(
  "/",
  authMiddleware,
  createOrderController
);

OrderRouter.get(
  "/user/:userId",
  authMiddleware,
  getUserOrdersController
);

OrderRouter.get(
  "/:id",
  authMiddleware,
  getSingleOrderController
);

OrderRouter.patch(
  "/:id/status",
  authMiddleware,
  updateOrderStatusController
);

OrderRouter.delete(
  "/:id",
  authMiddleware,
  deleteOrderController
);

export default OrderRouter;
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