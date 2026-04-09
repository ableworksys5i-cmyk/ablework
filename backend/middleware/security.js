const crypto = require('crypto');

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate a secure reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate password strength
const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 8;

  return {
    isValid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough,
    errors: []
      .concat(!hasUpperCase ? ['password must contain uppercase letter'] : [])
      .concat(!hasLowerCase ? ['password must contain lowercase letter'] : [])
      .concat(!hasNumbers ? ['password must contain number'] : [])
      .concat(!hasSpecialChar ? ['password must contain special character (!@#$%^&*)'] : [])
      .concat(!isLongEnough ? ['password must be at least 8 characters'] : [])
  };
};

module.exports = {
  generateVerificationCode,
  generateResetToken,
  validatePassword
};
