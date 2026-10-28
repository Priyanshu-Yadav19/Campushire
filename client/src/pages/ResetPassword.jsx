
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  LockKeyhole,
  Eye,
  EyeOff,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "./Auth.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError("This reset link is invalid. Request a new password reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });

      setSuccess(
        response.data.message ||
          "Password reset successfully. You can now log in."
      );

      setPassword("");
      setConfirmPassword("");

      // Redirect to login after a successful reset.
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Request a new link and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <section className="auth-card">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-icon">
            <GraduationCap size={29} strokeWidth={2.2} />
          </span>
          <span>
            Campus<span className="brand-highlight">Hire</span>
          </span>
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">ACCOUNT SECURITY</span>
          <h1>Reset password</h1>
          <p className="auth-subtitle">
            Choose a new password for your CampusHire account.
          </p>
        </div>

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="reset-password">New password</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={19} className="auth-input-icon" />
                <input
                  id="reset-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">Confirm new password</label>
              <div className="auth-input-wrap">
                <LockKeyhole size={19} className="auth-input-icon" />
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-message auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="auth-spinner" />
                  <span>Updating password...</span>
                </>
              ) : (
                <>
                  <span>Update password</span>
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>
        )}

        {success && (
          <div className="auth-message auth-success" role="status">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {!success && (
          <div className="auth-footer">
            <Link to="/forgot-password" className="auth-back-link">
              <ArrowLeft size={16} /> Request a new reset link
            </Link>
          </div>
        )}

        {success && (
          <div className="auth-footer">
            <Link to="/login">Go to sign in</Link>
          </div>
        )}
      </section>
    </main>
  );
}

export default ResetPassword;
