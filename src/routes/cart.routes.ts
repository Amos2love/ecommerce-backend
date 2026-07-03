import { Router } from "express";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  mergeCartController,
} from "../controllers/cart.controller";

import { cartMiddleware }
  from "../middlewares/cart.middleware";

const CartRouter = Router();


CartRouter.get(
    "/",
    cartMiddleware, 
    getCartController
);


CartRouter.post(
    "/items",
    cartMiddleware,
     addToCartController
);


CartRouter.patch(
    "/items/:productId",
    cartMiddleware,
    updateCartItemController
);


CartRouter.delete(
    "/items/:productId",
    cartMiddleware,
    removeCartItemController
);


CartRouter.post(
"/merge",
cartMiddleware,
mergeCartController
);

export default CartRouter;


/**
 * @swagger
 * tags:
 *   - name: Cart
 *     description: Shopping cart endpoints
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the current cart (guest or user)
 *     responses:
 *       200:
 *         description: Cart object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Cart not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * */

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *             required: [productId, quantity]
 *     responses:
 *       201:
 *         description: Item added
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   patch:
 *     tags: [Cart]
 *     summary: Update quantity for a cart item
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               quantity:
 *                 type: integer
 *             required: [quantity]
 *     responses:
 *       200:
 *         description: Item updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/cart/items/{productId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item removed
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/cart/merge:
 *   post:
 *     tags: [Cart]
 *     summary: Merge guest cart with user cart after signin
 *     responses:
 *       200:
 *         description: Carts merged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 */