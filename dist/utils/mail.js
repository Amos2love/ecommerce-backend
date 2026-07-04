"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
require("dotenv/config");
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
// verify ONCE at startup
transporter.verify()
    .then(() => console.log("SMTP server ready"))
    .catch((err) => console.error("SMTP error:", err));
const sendEmail = async (usermail, resetToken) => {
    try {
        const info = await transporter.sendMail({
            from: '"Rheochat" <support@rheochat.com>',
            to: usermail,
            subject: "Access Token",
            text: `Your OTP is: ${resetToken}`,
            html: `<h2>Your OTP is: ${resetToken}</h2>`,
        });
        console.log("Message sent:", info.messageId);
        return info;
    }
    catch (err) {
        console.error("Error while sending mail:", err);
        throw err;
    }
};
exports.sendEmail = sendEmail;
