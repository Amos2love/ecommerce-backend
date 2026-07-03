import express from "express";
import { upload } from "../middlewares/upload.middleware";

import {
  createProductController,
  getProductsController,
  getSingleProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller";

import { validate }
  from "../middlewares/validate.middleware"

import {
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validation";

import { authMiddleware }
  from "../middlewares/auth.middleware";

import { adminMiddleware }
  from "../middlewares/admin.middleware"

const productRouter = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Product management and browsing
 */

/**
 * @swagger
 * /api/product:
 *   get:
 *     tags: [Products]
 *     summary: Get list of products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: Product list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductList'
 */
productRouter.get(
  "/",
  getProductsController
);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a single product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
productRouter.get(
  "/:id",
  getSingleProductController
);

/**
 * @swagger
 * /api/product:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       201:
 *         description: Product created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
productRouter.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validate(createProductSchema),
  createProductController
);

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       200:
 *         description: Product updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
productRouter.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  validate(updateProductSchema),
  updateProductController
);

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin only)
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
 *         description: Product deleted
 *       404:
 *         description: Not found
 */
productRouter.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProductController
);

export default productRouter;
