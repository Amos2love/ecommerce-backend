import { Request, Response } from "express";
import { initializeFlutterwavePayment } from "../services/payment.service";
import { getOrderById, updateOrderStatus } from "../services/order.service";

// --- 1. THE CHECKOUT CONTROLLER ---
export const initiateCheckoutController = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Fetch order from DB to prevent users from manipulating the price
    const order = await getOrderById(orderId);
    
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "PENDING") return res.status(400).json({ message: "Order already processed" });

    // Ask the Service layer for the link
    const checkoutUrl = await initializeFlutterwavePayment(
      order.id,
      Number(order.total),
      "customer@example.com", // In a real app: order.user.email1
      order.shippingName
    );

    return res.status(200).json({ success: true, checkoutUrl });

  } catch (error) {
    return res.status(500).json({ message: "Failed to initiate checkout" });
  }
};

// --- 2. THE WEBHOOK CONTROLLER ---
export const flutterwaveWebhookController = async (req: Request, res: Response) => {
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

      await updateOrderStatus(orderId, "PAID", transactionId);
      console.log(`✅ Order ${orderId} marked as PAID`);
    }

    // Always acknowledge receipt to Flutterwave
    return res.status(200).end();

  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).end();
  }
};