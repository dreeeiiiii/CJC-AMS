import type { Request, Response } from "express";
import prisma from "../db.js";
import { sendOTP } from "../utils/emails.js";
import bcrypt from "bcrypt";


// -------------------- FORGOT PASSWORD --------------------

type ForgotPasswordBody = {
  email: string;
};

export const forgotPassword = async (
  req: Request<{}, {}, ForgotPasswordBody>,
  res: Response
) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await prisma.member.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({ message: "If email exists, OTP was sent" });   
     }

    // delete old OTPs
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await sendOTP(email, otp);

    return res.status(200).json({
      message: "OTP sent to email",
    });

  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -------------------- VERIFY OTP --------------------

type VerifyOtpBody = {
  email: string;
  otp: string;
};

export const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpBody>,
  res: Response
) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // ❗ IMPORTANT: delete OTP after successful verification
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    return res.status(200).json({
      message: "OTP verified successfully",
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// -------------------- RESET PASSWORD --------------------

type ResetPasswordBody = {
  email: string;
  password: string;
};

export const resetPassword = async (
  req: Request<{}, {}, ResetPasswordBody>,
  res: Response
) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await prisma.member.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.member.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    // OPTIONAL: cleanup any leftover OTPs
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      message: "Server error",
    });
  }
};