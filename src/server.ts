import dotenv from "dotenv";
import app from "./app";
import { connectRedis } from "./utils/redis";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Redis 
    await connectRedis();
    console.log("✅ Redis successfully connected");

    // 2. Start the Express server SECOND
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); 
  }
};

// Execute the startup sequence
startServer();