"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
const redis_1 = require("redis");
const redis = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
redis.on("error", (err) => {
    console.error("Redis Error:", err);
});
const connectRedis = async () => {
    if (!redis.isOpen) {
        await redis.connect();
    }
};
exports.connectRedis = connectRedis;
exports.default = redis;
