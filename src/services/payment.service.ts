import axios from "axios";

export const initializeFlutterwavePayment = async (
  orderId: string,
  amount: number,
  customerEmail: string,
  customerName: string
) => {
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

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      return response.data.data.link; // The secure URL the user will visit to pay
    } else {
      throw new Error("Failed to generate payment link");
    }
  } catch (error) {
    console.error("Flutterwave API Error:", error);
    throw new Error("Payment initialization failed");
  }
};