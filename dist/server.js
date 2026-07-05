"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./lib/prisma");
const redis_1 = require("@upstash/redis");
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!redisUrl || !redisToken) {
    throw new Error("Missing Upstash Redis environment variables");
}
exports.redis = new redis_1.Redis({
    url: redisUrl,
    token: redisToken,
});
const PORT = Number(process.env.PORT) || 3000;
const startServer = async () => {
    try {
        // Test Redis Connection
        await exports.redis.ping();
        console.log("✅ Redis successfully authenticated");
        // Test Database Connection
        await prisma_1.prisma.$connect();
        console.log("✅ Successfully connected to Neon Database");
        // Start Server
        app_1.default.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
process.on("SIGTERM", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
process.on("SIGINT", async () => {
    await prisma_1.prisma.$disconnect();
    process.exit(0);
});
startServer();
