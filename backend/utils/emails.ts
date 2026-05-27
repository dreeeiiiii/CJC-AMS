import 'dotenv/config'; // Automatically loads environment variables from .env
import nodemailer from 'nodemailer';

// 1. Initialize the transporter with your credentials
// We use 'as string' because process.env values can technically be undefined
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER as string, 
    pass: process.env.EMAIL_PASS as string  
  }
});

/**
 * Sends a 6-digit OTP code to a specified email address.
 * @param targetEmail - The recipient's email address
 * @param otpCode - The code to send (can be a string or number)
 */
export async function sendOTP(targetEmail: string, otpCode: string | number): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,       // Your Gmail address
      to: targetEmail,                    // The user's destination email
      subject: 'Your OTP Code',
      text: `Your code is ${otpCode}`,    // Plain text body
      html: `<p>Your verification code is: <strong>${otpCode}</strong></p>` // Clean HTML fallback
    });

    console.log(`OTP sent successfully to ${targetEmail}! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
  }
}
