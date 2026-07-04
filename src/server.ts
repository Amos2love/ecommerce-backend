import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

import app from "./app";
import { Redis } from '@upstash/redis';
// 2. Removed the connectRedis import so it doesn't crash looking for a missing file

dotenv.config();



// Initialize Upstash Redis Client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0'; // Correctly configured for Render

const startServer = async () => {
  try {
    // 1. Connect to Redis 
    await redis.ping();
    console.log("✅ Redis successfully authenticated");

    // Test Database Connection
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon Database.');

    // 2. Start the Express server SECOND
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server is running on ${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); 
  }
};

// Execute the startup sequence
startServer();