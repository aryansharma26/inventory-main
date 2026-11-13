import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Inventory System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error;
  }
};

export const getPasswordResetTemplate = (resetUrl, name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset for your Inventory Management account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p style="color: #666;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>
  `;
};
