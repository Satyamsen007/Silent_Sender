import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import VerificationEmail from "../../emails/verificationEmail";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  service: "gmail", // Change to your SMTP provider (e.g., Outlook, SMTP server)
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password (for Gmail)
  },
});

export async function sendVerificationEmail(email, username, verifiecode) {
  console.log(email);

  try {
    const htmlContent = render(VerificationEmail({ username, otp: verifiecode }));

    const mailOptions = {
      from: `"SilentSender" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "SilentSender | Verification Code",
      html: await htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: "Verification email sent successfully",
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      message: "Failed to send verification email",
    };
  }
}