import { Request, Response, RequestHandler } from "express";
import { OrderParams } from "../types/order";
import { OrderStatus } from "../generated/prisma";

import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  softDeleteOrder,
} from "../services/order.service";

export const createOrderController = async (
  req: Request,
  res: Response
) => {
  try {
    const { userId, shippingDetails, paymentMethod } = req.body;

    if (!userId || !shippingDetails) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields for checkout",
      });
    }

    const newOrder = await createOrder(
      userId,
      shippingDetails,
      paymentMethod
    );

    return res.status(201).json({
      success: true,
      order: newOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create order",
    });
  }
};

export const getUserOrdersController = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const orders = await getUserOrders(userId);

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Fetch User Orders Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch user orders",
    });
  }
};

export const getSingleOrderController = async (
  req: Request<OrderParams>,
  res: Response
) => {
  try {
    const order = await getOrderById(req.params.id);

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Single Order Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch order details";

    const statusCode =
      message === "Order not found"
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

export const updateOrderStatusController = async (
  req: Request<OrderParams>,
  res: Response
) => {
  
  try {
    const status = req.body.status as OrderStatus;
    const { transactionId, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required to update order",
      });
    }

    const updatedOrder = await updateOrderStatus(
      req.params.id,
      status,
      transactionId,
      trackingNumber
    );

    return res.status(200).json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    });
  }
};

export const deleteOrderController:RequestHandler<OrderParams> = async (
  req: Request<OrderParams>,
  res: Response
) => {
  try {
    await getOrderById(req.params.id);

    await softDeleteOrder(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Order was successfully deleted (hidden)",
    });
  } catch (error) {
    console.error("Delete Order Error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete order";

    const statusCode =
      message === "Order not found"
        ? 404
        : 500;

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
};