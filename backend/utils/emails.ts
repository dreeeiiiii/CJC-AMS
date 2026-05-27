import { Resend } from "resend";

const getResend = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set. Skipping email send.");
    return null;
  }
  return new Resend(key);
};

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    const resend = getResend();
    if (!resend) return; // silently skip in non-production or when not configured

    await resend.emails.send({
      from: "CJCSched <onboarding@resend.dev>",
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