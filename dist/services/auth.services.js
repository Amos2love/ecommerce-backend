"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenService = exports.resetPasswordService = exports.verifyResetTokenService = exports.forgotPasswordService = exports.SigninService = exports.SignupService = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
const mail_1 = require("../utils/mail");
const token_1 = require("../utils/token");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cart_service_1 = require("../services/cart.service");
const SignupService = async (email, password, name) => {
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email }, });
    if (existingUser) {
        throw new Error("user already exist");
    }
    const hashedPassword = await (0, bcrypt_1.hashPassword)(password);
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword
        }
    });
    const accessToken = (0, jwt_1.generateToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        accessToken,
        refreshToken
    };
};
exports.SignupService = SignupService;
const SigninService = async (email, password, sessionId) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("invalid credential");
    }
    const compare = await (0, bcrypt_1.comparePassword)(password, user.password);
    if (!compare) {
        throw new Error("invalid credential");
    }
    if (sessionId) {
        await (0, cart_service_1.mergeGuestCartIntoUserCart)(sessionId, user.id);
    }
    const accessToken = (0, jwt_1.generateToken)(user.id);
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
        },
        refreshToken,
        accessToken,
    };
};
exports.SigninService = SigninService;
const forgotPasswordService = async (email) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("user not found");
    }
    const resetToken = (0, token_1.generate6DigitToken)();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await prisma_1.prisma.user.update({
        where: { email },
        data: {
            resetPasswordToken: resetToken,
            resetPasswordExp: resetTokenExpiry,
            tokenAttempts: 0
        }
    });
    await (0, mail_1.sendEmail)(user.email, resetToken);
    return {
        message: "password reset token sent to email",
        resetToken
    };
};
exports.forgotPasswordService = forgotPasswordService;
const verifyResetTokenService = async (email, token) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("user not found");
    }
    if (!user.resetPasswordExp || user.resetPasswordExp < new Date()) {
        throw new Error("invalid or expired token");
    }
    if (user.tokenAttempts >= 3) {
        throw new Error("too many invalid attempts, please request a new token");
    }
    if (user.resetPasswordToken !== token) {
        await prisma_1.prisma.user.update({
            where: { email },
            data: { tokenAttempts: { increment: 1 } }
        });
        throw new Error("invalid token");
    }
    const resetSessionToken = crypto.randomUUID();
    const resetSessionExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.prisma.user.update({
        where: { email },
        data: {
            tokenAttempts: 0,
            resetPasswordToken: null,
            resetPasswordExp: null,
            resetSessionToken,
            resetSessionExpiry
        }
    });
    return {
        message: "token verified, you can now reset your password",
        resetSessionToken
    };
};
exports.verifyResetTokenService = verifyResetTokenService;
const resetPasswordService = async (resetSessionToken, newPassword) => {
    const user = await prisma_1.prisma.user.findFirst({
        where: {
            resetSessionToken,
            resetSessionExpiry: {
                gt: new Date(),
            },
        },
    });
    if (!user) {
        throw new Error("Invalid or expired reset session");
    }
    const hashedPassword = await (0, bcrypt_1.hashPassword)(newPassword);
    await prisma_1.prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            password: hashedPassword,
            // destroy session after use
            resetSessionToken: null,
            resetSessionExpiry: null,
        },
    });
    return {
        message: "Password reset successful",
    };
};
exports.resetPasswordService = resetPasswordService;
const refreshTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error("Refresh token required");
    }
    const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma_1.prisma.user.findFirst({
        where: { refreshToken },
    });
    if (!user) {
        throw new Error("Invalid refresh token");
    }
    const newAccessToken = (0, jwt_1.generateToken)(user.id);
    return {
        accessToken: newAccessToken,
    };
};
exports.refreshTokenService = refreshTokenService;
