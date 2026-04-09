import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail, resendVerificationCode } from "../api/api";
import "./VerifyEmail.css";

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  const user_id = searchParams.get("user_id");
  const email = searchParams.get("email");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }

    if (!user_id) {
      setError("User ID missing. Please register again.");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyEmail({
        user_id: parseInt(user_id),
        verification_code: verificationCode
      });

      if (response.success) {
        setMessage("✓ Email verified successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!user_id) {
      setError("User ID missing. Please register again.");
      return;
    }

    setResendLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await resendVerificationCode({ user_id: parseInt(user_id) });

      if (response.success) {
        setMessage("✓ Verification code sent to your email!");
      } else {
        setError(response.message || "Failed to resend code");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("Failed to resend code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <h2>Verify Your Email</h2>
        <p className="verify-email-info">
          We've sent a verification code to <strong>{email || "your email"}</strong>
        </p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="verificationCode">Verification Code:</label>
            <input
              id="verificationCode"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <button
            type="submit"
            disabled={loading}
            className="verify-btn"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <div className="resend-section">
          <p className="resend-text">Didn't receive the code?</p>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="resend-btn"
          >
            {resendLoading ? "Sending..." : "Resend Code"}
          </button>
        </div>

        <p className="back-to-login">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="link-btn"
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
