
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  LoaderCircle,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "./Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(
        response.data.message ||
          "If an account exists with that email, a password reset link will be sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request right now. Please try again."
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
          <span className="auth-eyebrow">ACCOUNT RECOVERY</span>
          <h1>Forgot password?</h1>
          <p className="auth-subtitle">
            Enter your registered email address and we'll send you
            instructions to reset your password.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="forgot-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={19} className="auth-input-icon" />
              <input
                id="forgot-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          {message && (
            <div className="auth-message auth-success" role="status">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>
          )}

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
                <span>Sending request...</span>
              </>
            ) : (
              <>
                <span>Send reset link</span>
                <Mail size={19} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} /> Back to sign in
          </Link>
        </div>
      </section>
    </main>
  );
}

export default ForgotPassword;
