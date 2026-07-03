import "dotenv/config";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
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
  .catch((err: any) => console.error("SMTP error:", err));

export const sendEmail = async (usermail: string, resetToken: string) => {
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
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};