import "dotenv/config";

import app from "./app";
import { prisma } from "./lib/prisma";
import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!redisUrl || !redisToken) {
  throw new Error("Missing Upstash Redis environment variables");
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    // Test Redis Connection
    await redis.ping();
    console.log("✅ Redis successfully authenticated");

    // Test Database Connection
    await prisma.$connect();
    console.log("✅ Successfully connected to Neon Database");

    // Start Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();