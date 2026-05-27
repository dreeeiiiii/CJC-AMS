import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    await resend.emails.send({
      from: "CJCSched <onboarding@resend.dev>", // you can change later
      to: email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial;">
          <h2>Password Reset Request</h2>
          <p>Your OTP code is:</p>
          <h1 style="letter-spacing: 4px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email error:", err);
    throw new Error("Failed to send OTP email");
  }
};