# Forgot Password Feature - Quick Start Guide

## What's New?
A complete "Forgot Password" functionality has been added to the application with email verification and secure password reset.

## User Flow

### Step 1: Request Password Reset
1. User goes to Login page
2. Clicks "Forgot password?" link
3. Enters their registered email
4. Receives 6-digit reset code via email

### Step 2: Verify Identity
1. User enters the 6-digit code on verification page
2. System validates code (must not be expired, must not be used before)
3. On success, redirects to password reset page

### Step 3: Reset Password
1. User enters new password
2. Confirms new password
3. Sees password strength indicator (Weak → Strong)
4. Clicks "Reset Password"
5. Password is updated, redirected to login
6. User can now login with new password

## Key Features

### Security
- ✅ Email-based verification (confirms user owns email)
- ✅ 6-digit codes valid for only 15 minutes
- ✅ Codes can only be used once
- ✅ Passwords hashed with bcrypt (secure)
- ✅ Weak passwords prevented by strength meter

### User Experience
- ✅ Clear inline error messages (no pop-up alerts)
- ✅ Real-time password strength feedback
- ✅ Show/hide password toggle
- ✅ Password match validation
- ✅ Auto-redirect after successful verification
- ✅ Mobile responsive design

### Reliability
- ✅ Email fallback to console logging (for testing)
- ✅ Proper error handling at each step
- ✅ Prevents accidental double submissions
- ✅ Invalid code/expired code messages

## Database Changes

### New Table: `password_resets`
Created to track password reset requests:
- Stores user_id, reset code, expiration time
- Marks codes as used after successful reset
- Automatically cleaned up by deletion

```sql
CREATE TABLE password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  reset_code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### 1. Request Password Reset
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset code.",
  "user_id": 123,
  "email": "user@example.com"
}
```

### 2. Verify Reset Code
```
POST /api/auth/verify-reset-code
Content-Type: application/json

{
  "user_id": 123,
  "reset_code": "123456"
}

Response:
{
  "success": true,
  "message": "Reset code verified successfully"
}
```

### 3. Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "user_id": 123,
  "reset_code": "123456",
  "new_password": "NewPassword123!"
}

Response:
{
  "success": true,
  "message": "Password reset successfully! Please login with your new password."
}
```

## Pages Added

### ForgotPassword.jsx (`/forgot-password`)
- Simple form to request password reset
- Auto-redirects to verification on success
- Error messages displayed inline

### VerifyResetCode.jsx (`/verify-reset-code`)
- 6-digit code input
- Large font for easy reading
- Shows expiration reminder
- Option to request new code

### ResetPassword.jsx (`/reset-password`)
- Password input with strength meter
- Show/hide toggle for password visibility
- Real-time password matching validation
- Prevents weak passwords
- Redirects to login on success

## Testing

### Test in Browser
1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Visit**: http://localhost:5174/login
4. **Click**: "Forgot password?"
5. **Enter**: Your registered email
6. **Copy Code**: From console or email
7. **Verify**: Enter code on next page
8. **Reset**: Enter new password and confirm
9. **Login**: Use new password to login

### Test Codes
When email service not configured, check console for verification code:
```
📧 PASSWORD RESET CODE FOR user@example.com: 123456
```

## Email Configuration

The system uses Gmail SMTP (already configured):
- Email service checks for valid credentials at startup
- Falls back to console logging if credentials not available
- Both methods work for testing and production

## Error Scenarios Handled

| Scenario | Message | Solution |
|----------|---------|----------|
| Invalid email | "Email is required" | Enter a valid email |
| Email not found | "...you will receive..." | Use correct email or register |
| Wrong code | "Invalid or expired code" | Check email again |
| Expired code | "Invalid or expired code" | Request new code (expires in 15 min) |
| Weak password | Button disabled | Make password stronger |
| Passwords mismatch | "Passwords do not match" | Confirm password matches |
| Missing fields | "All fields required" | Fill all fields |

## Security Best Practices Implemented

1. **Email Verification**: Must verify email ownership
2. **Short Expiration**: Codes expire in 15 minutes (low security risk window)
3. **One-Time Use**: Each code works only once (prevents replay attacks)
4. **Hash Passwords**: All passwords hashed with bcrypt
5. **No Email Disclosure**: System doesn't reveal if email exists (prevents user enumeration)
6. **Rate Limiting**: Can be added if spam becomes issue

## Related Features

### Email Verification (Registration)
Uses same verification code system but for email confirmation during signup.
- 6-digit code sent to email
- 15-minute expiration
- Applicant/Employer profile created only after verification

### Password Management
- Passwords hashed with bcrypt (10 rounds)
- Minimum 6 characters enforced
- Different from email verification (separate process)

## Troubleshooting

### "Password reset email not received"
- Check spam/junk folder
- Check console for code (if email not configured)
- Wait a few seconds (email takes time)
- Request new code (old code expires in 15 min)

### "Reset code expired"
- Codes valid for 15 minutes
- Request new code via "Didn't receive code?" link
- Try again immediately with new code

### "Passwords do not match"
- Confirm password must match exactly
- Check for spaces or extra characters
- Use show/hide toggle to verify

### "Cannot proceed to reset page"
- Make sure you're coming from verify-reset-code
- Reset code might have expired
- Start over from forgot-password page

## File Changes Summary

### Backend Files
- `authController.js`: Added forgotPassword(), verifyResetCode(), resetPassword()
- `authRoutes.js`: Added 3 new POST routes
- `emailService.js`: Updated sendPasswordResetEmail()
- New: `migrations/create_password_resets_table.sql`

### Frontend Files
- New: `pages/ForgotPassword.jsx`
- New: `pages/VerifyResetCode.jsx`
- New: `pages/ResetPassword.jsx`
- `App.jsx`: Added 3 new routes
- `pages/Login.jsx`: Updated forgot password link
- `api/api.js`: Added 3 API methods

## Next Steps (Optional Enhancements)

1. Add rate limiting to prevent brute force
2. Add CSRF token protection
3. Send email notification when password changed
4. Add login attempt logging
5. Implement two-factor authentication
6. Add SMS as backup verification method
7. Allow password history to prevent reuse
8. Add security questions as additional verification

## Support

For issues or questions:
1. Check troubleshooting section above
2. Check console logs for error messages
3. Review FORGOT_PASSWORD_IMPLEMENTATION.md for detailed docs
4. Check email (or console) for verification codes
