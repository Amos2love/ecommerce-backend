"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.resetPassword = exports.verifyResetToken = exports.forgotPassword = exports.Signin = exports.Signup = void 0;
const auth_services_1 = require("../services/auth.services");
const auth_services_2 = require("../services/auth.services");
const auth_services_3 = require("../services/auth.services");
const auth_services_4 = require("../services/auth.services");
const auth_services_5 = require("../services/auth.services");
const Signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const result = await (0, auth_services_1.SignupService)(email, password, name);
        res.status(201).json({
            message: "user created successfully",
            ...result
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
exports.Signup = Signup;
const Signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await (0, auth_services_1.SigninService)(email, password);
        res.status(200).json({
            message: "Login Successful",
            ...result
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
exports.Signin = Signin;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await (0, auth_services_2.forgotPasswordService)(email);
        res.status(200).json({
            ...result,
            message: "password reset link sent to your email"
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
exports.forgotPassword = forgotPassword;
const verifyResetToken = async (req, res) => {
    try {
        const { email, token } = req.body;
        const result = await (0, auth_services_3.verifyResetTokenService)(email, token);
        res.status(200).json({
            ...result,
            message: "token verified successfully"
        });
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
exports.verifyResetToken = verifyResetToken;
const resetPassword = async (req, res) => {
    try {
        const { resetSessionToken, newPassword } = req.body;
        const result = await (0, auth_services_4.resetPasswordService)(resetSessionToken, newPassword);
        return res.status(200).json(result);
    }
    catch (err) {
        return res.status(400).json({
            message: err.message,
        });
    }
};
exports.resetPassword = resetPassword;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const result = await (0, auth_services_5.refreshTokenService)(refreshToken);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};
exports.refreshToken = refreshToken;
