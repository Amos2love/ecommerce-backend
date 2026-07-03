import { Router } from "express";
import { 
  initiateCheckoutController, 
  flutterwaveWebhookController 
} from "../controllers/payment.controller";

const PaymentRouter = Router();

// Endpoint for frontend to get the payment link
PaymentRouter.post("/:orderId/checkout", initiateCheckoutController);

// Hidden endpoint for Flutterwave's servers to ping
PaymentRouter.post("/webhooks", flutterwaveWebhookController);

export default PaymentRouter;

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Payment initiation and webhooks
 */

/**
 * @swagger
 * /api/payments/{orderId}/checkout:
 *   post:
 *     tags: [Payments]
 *     summary: Initiate payment for an order (returns payment link)
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment link or redirect
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 paymentLink:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/payments/webhooks:
 *   post:
 *     tags: [Payments]
 *     summary: Payment provider webhook endpoint
 *     description: Hidden endpoint called by payment providers to update payment status.
 *     responses:
 *       200:
 *         description: Webhook received
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 */