"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_middleware_1 = require("../middlewares/upload.middleware");
const product_controller_1 = require("../controllers/product.controller");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const product_validation_1 = require("../validators/product.validation");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const admin_middleware_1 = require("../middlewares/admin.middleware");
const productRouter = express_1.default.Router();
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
productRouter.get("/", product_controller_1.getProductsController);
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
productRouter.get("/:id", product_controller_1.getSingleProductController);
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
productRouter.post("/", auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload_middleware_1.upload.single("image"), (0, validate_middleware_1.validate)(product_validation_1.createProductSchema), product_controller_1.createProductController);
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
productRouter.put("/:id", auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, upload_middleware_1.upload.single("image"), (0, validate_middleware_1.validate)(product_validation_1.updateProductSchema), product_controller_1.updateProductController);
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
productRouter.delete("/:id", auth_middleware_1.authMiddleware, admin_middleware_1.adminMiddleware, product_controller_1.deleteProductController);
exports.default = productRouter;
