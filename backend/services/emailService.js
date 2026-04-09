const nodemailer = require('nodemailer');

// Check if Gmail credentials are configured
const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.EMAIL_APP_PASSWORD;
const hasEmailConfig = emailUser &&
                      emailUser !== 'your-gmail@gmail.com' &&
                      emailPassword &&
                      emailPassword !== 'your-app-password-here' &&
                      emailPassword.length >= 10; // App passwords are typically 16 chars

console.log('📧 Email config check:', {
  hasUser: !!emailUser,
  hasPassword: !!emailPassword,
  userValid: emailUser !== 'your-gmail@gmail.com',
  passwordValid: emailPassword !== 'your-app-password-here',
  passwordLength: emailPassword ? emailPassword.length : 0,
  hasEmailConfig: hasEmailConfig
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    // Log verification code to console for testing
    console.log(`\n📧 VERIFICATION CODE FOR ${email}: ${verificationCode}`);
    
    if (!hasEmailConfig) {
      console.log('⚠️  Email credentials not configured. Code logged above for testing.');
      return true;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - AbleWork',
      html: `
        <h2>Welcome to AbleWork!</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
    console.log('✅ Verification email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw - allow registration to continue even if email fails
    return true;
  }
};

const sendPasswordResetEmail = async (email, resetCode) => {
  try {
    // Log reset code to console for testing
    console.log(`\n📧 PASSWORD RESET CODE FOR ${email}: ${resetCode}`);
    
    if (!hasEmailConfig) {
      console.log('⚠️  Email credentials not configured. Code logged above for testing.');
      return true;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset - AbleWork',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your password reset code is: <strong>${resetCode}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>Enter this code on the password reset page to create a new password.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
    console.log('✅ Password reset email sent to:', email);
    return true;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw - allow process to continue even if email fails
    return true;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
