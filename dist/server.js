"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("./generated/prisma");
const app_1 = __importDefault(require("./app"));
const redis_1 = require("@upstash/redis");
// 2. Removed the connectRedis import so it doesn't crash looking for a missing file
dotenv_1.default.config();
const prisma = new prisma_1.PrismaClient();
// Initialize Upstash Redis Client
exports.redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = '0.0.0.0'; // Correctly configured for Render
const startServer = async () => {
    try {
        // 1. Connect to Redis 
        await exports.redis.ping();
        console.log("✅ Redis successfully authenticated");
        // Test Database Connection
        await prisma.$connect();
        console.log('✅ Successfully connected to Neon Database.');
        // 2. Start the Express server SECOND
        app_1.default.listen(PORT, HOST, () => {
            console.log(`🚀 Server is running on ${HOST}:${PORT}`);
        });
    }
    catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};
// Execute the startup sequence
startServer();
