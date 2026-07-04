"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductController = exports.updateProductController = exports.getSingleProductController = exports.getProductsController = exports.createProductController = void 0;
const cloudinary_1 = require("../utils/cloudinary");
const cloudinary_2 = __importDefault(require("../utils/cloudinary"));
const product_services_1 = require("../services/product.services");
const createProductController = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: "Image is required" });
        }
        const cloudinaryResult = await (0, cloudinary_1.uploadStream)(file.buffer, "products");
        const product = await (0, product_services_1.createProductService)({
            title: req.body.title,
            description: req.body.description,
            price: Number(req.body.price),
            stock: Number(req.body.stock),
            imageUrl: cloudinaryResult.secure_url,
            imageId: cloudinaryResult.public_id,
        });
        return res.status(201).json({ success: true, product });
    }
    catch (error) {
        console.error("Create Product Error:", error); // Helpful for debugging
        return res.status(500).json({ message: "Failed to create product" });
    }
};
exports.createProductController = createProductController;
const getProductsController = async (req, res) => {
    try {
        const products = await (0, product_services_1.getAllProductsService)();
        return res.status(200).json({
            success: true,
            products,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};
exports.getProductsController = getProductsController;
const getSingleProductController = async (req, res) => {
    try {
        const product = await (0, product_services_1.getProductByIdService)(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        return res.status(200).json({
            success: true,
            product,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
};
exports.getSingleProductController = getSingleProductController;
const updateProductController = async (req, res) => {
    try {
        const file = req.file;
        const updateData = { ...req.body };
        if (req.body.price)
            updateData.price = Number(req.body.price);
        if (req.body.stock)
            updateData.stock = Number(req.body.stock);
        if (file) {
            // 1. Fetch the existing product data to find the old imageId
            const currentProduct = await (0, product_services_1.getProductByIdService)(req.params.id);
            if (currentProduct && currentProduct.imageId) {
                await cloudinary_2.default.uploader.destroy(currentProduct.imageId);
            }
            // 3. Upload the new memory buffer
            const cloudinaryResult = await (0, cloudinary_1.uploadStream)(file.buffer, "products");
            updateData.imageUrl = cloudinaryResult.secure_url;
            updateData.imageId = cloudinaryResult.public_id; // Overwrite with the new ID
        }
        const updated = await (0, product_services_1.updateProductService)(req.params.id, updateData);
        return res.status(200).json({ success: true, product: updated });
    }
    catch (error) {
        console.error("Update Error:", error);
        return res.status(500).json({ message: "Failed to update product" });
    }
};
exports.updateProductController = updateProductController;
const deleteProductController = async (req, res) => {
    try {
        const product = await (0, product_services_1.getProductByIdService)(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        if (product.imageId) {
            await cloudinary_2.default.uploader.destroy(product.imageId);
        }
        await (0, product_services_1.deleteProductService)(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product and its image were successfully deleted",
        });
    }
    catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).json({ success: false, message: "Failed to delete product" });
    }
};
exports.deleteProductController = deleteProductController;
