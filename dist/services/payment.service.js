"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFlutterwavePayment = void 0;
const axios_1 = __importDefault(require("axios"));
const initializeFlutterwavePayment = async (orderId, amount, customerEmail, customerName) => {
    try {
        const payload = {
            tx_ref: orderId, // The bridge between your DB and Flutterwave
            amount: amount.toString(),
            currency: "NGN",
            redirect_url: "https://your-frontend.com/order-success",
            customer: {
                email: customerEmail,
                name: customerName,
            },
            customizations: {
                title: "Portfolio Store Checkout",
            },
        };
        const response = await axios_1.default.post("https://api.flutterwave.com/v3/payments", payload, {
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });
        if (response.data.status === "success") {
            return response.data.data.link; // The secure URL the user will visit to pay
        }
        else {
            throw new Error("Failed to generate payment link");
        }
    }
    catch (error) {
        console.error("Flutterwave API Error:", error);
        throw new Error("Payment initialization failed");
    }
};
exports.initializeFlutterwavePayment = initializeFlutterwavePayment;
