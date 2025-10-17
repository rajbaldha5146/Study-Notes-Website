import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken, name) => {
  console.log("📧 Email Service Debug:");
  console.log("NODEMAILER_USER:", process.env.NODEMAILER_USER);
  console.log(
    "NODEMAILER_PASS:",
    process.env.NODEMAILER_PASS ? "Set ✅" : "Not Set ❌"
  );
  console.log("CLIENT_URL:", process.env.CLIENT_URL);
  console.log("Target email:", email);
  console.log("Verification token:", verificationToken);

  const transporter = createTransporter();

  // Verify transporter configuration
  try {
    await transporter.verify();
    console.log("✅ SMTP connection verified");
  } catch (verifyError) {
    console.error("❌ SMTP verification failed:", verifyError.message);
    throw verifyError;
  }

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  console.log("Verification URL:", verificationUrl);

  const mailOptions = {
    from: {
      name: "StudyNotes App",
      address: process.env.NODEMAILER_USER,
    },
    to: email,
    subject: "Verify Your Email Address - StudyNotes",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Welcome to StudyNotes!</h1>
          <p style="color: #666; font-size: 16px;">Please verify your email address to get started</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Hi ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            Thank you for signing up! To complete your registration and secure your account, 
            please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">
              ${verificationUrl}
            </a>
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    console.log("📤 Sending email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Verification email sent successfully");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    return true;
  } catch (error) {
    console.error("❌ Error sending verification email:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  const transporter = createTransporter();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: {
      name: "Your App Name",
      address: process.env.NODEMAILER_USER,
    },
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Password Reset Request</h1>
          <p style="color: #666; font-size: 16px;">Reset your password securely</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Hi ${name}!</h2>
          <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 5px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 25px;">
            If the button doesn't work, copy and paste this link into your browser:
            <br>
            <a href="${resetUrl}" style="color: #dc3545; word-break: break-all;">
              ${resetUrl}
            </a>
          </p>
        </div>
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p>This reset link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};
