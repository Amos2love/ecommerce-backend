import { Request, Response } from "express";
import {ProductParams} from "../types/product";
import { uploadStream } from "../utils/cloudinary";
import cloudinary from "../utils/cloudinary";

import {
  createProductService,
  getAllProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "../services/product.services";

export const createProductController = async (req: Request, res: Response) => {
  try {
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const cloudinaryResult: any = await uploadStream(file.buffer, "products");
    const product = await createProductService({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      imageUrl: cloudinaryResult.secure_url,
      imageId: cloudinaryResult.public_id,
    });

    return res.status(201).json({ success: true, product });

  } catch (error) {
    console.error("Create Product Error:", error); // Helpful for debugging
    return res.status(500).json({ message: "Failed to create product" });
  }
};

export const getProductsController =
  async (
    req: Request,
    res: Response
  ) => {

    try {

      const products =
        await getAllProductsService();

      return res.status(200).json({
        success: true,
        products,
      });

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: "Failed to fetch products",
      });

    }

};

export const getSingleProductController =
  async (
    req: Request<ProductParams>,
    res: Response
  ) => {

    try {

      const product =
        await getProductByIdService(
          req.params.id
        );

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

    } catch (error) {

      return res.status(500).json({
        success: false,
        message: "Failed to fetch product",
      });

    }

};

export const updateProductController = async (req: Request<ProductParams>, res: Response) => {
  try {
    const file = req.file as any;
    const updateData: any = { ...req.body };

    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.stock) updateData.stock = Number(req.body.stock);

    if (file) {
      // 1. Fetch the existing product data to find the old imageId
      const currentProduct = await getProductByIdService(req.params.id);
      
      if (currentProduct && currentProduct.imageId) {
        await cloudinary.uploader.destroy(currentProduct.imageId);
      }

      // 3. Upload the new memory buffer
      const cloudinaryResult: any = await uploadStream(file.buffer, "products");
      updateData.imageUrl = cloudinaryResult.secure_url;
      updateData.imageId = cloudinaryResult.public_id; // Overwrite with the new ID
    }

    const updated = await updateProductService(req.params.id, updateData);

    return res.status(200).json({ success: true, product: updated });

  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProductController = async (req: Request<ProductParams>, res: Response) => {
  try {
    const product = await getProductByIdService(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.imageId) {
      await cloudinary.uploader.destroy(product.imageId);
    }

    await deleteProductService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product and its image were successfully deleted",
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};