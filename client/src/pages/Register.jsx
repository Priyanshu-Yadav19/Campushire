
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  UserRound,
  BriefcaseBusiness,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import "./Auth.css";

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showInvitationCode, setShowInvitationCode] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "officer" && !invitationCode.trim()) {
      setError("Please enter the officer invitation code.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      };

      if (role === "officer") {
        payload.invitationCode = invitationCode.trim();
      }

      const response = await api.post("/auth/register", payload);

      setSuccess(
        response.data.message || "Account created successfully!"
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { registeredEmail: email.trim() },
        });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed. Please try again."
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
          <span>Campus<span className="brand-highlight">Hire</span></span>
        </Link>

        <div className="auth-heading">
          <span className="auth-eyebrow">GET STARTED FOR FREE</span>
          <h1>Create your account</h1>
          <p className="auth-subtitle">
            Your next opportunity starts here. Join CampusHire today.
          </p>
        </div>

        <div className="role-options" aria-label="Choose account type">
          <button
            type="button"
            className={`role-option ${role === "student" ? "active" : ""}`}
            aria-pressed={role === "student"}
            onClick={() => {
              setRole("student");
              setError("");
              setSuccess("");
            }}
          >
            <UserRound size={21} />
            <span>Student</span>
            {role === "student" && (
              <span className="role-check">✓</span>
            )}
          </button>

          <button
            type="button"
            className={`role-option ${role === "officer" ? "active" : ""}`}
            aria-pressed={role === "officer"}
            onClick={() => {
              setRole("officer");
              setError("");
              setSuccess("");
            }}
          >
            <BriefcaseBusiness size={21} />
            <span>Placement Officer</span>
            {role === "officer" && (
              <span className="role-check">✓</span>
            )}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="name">Full name</label>
            <div className="auth-input-wrap">
              <UserRound size={19} className="auth-input-icon" />
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                minLength={2}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={19} className="auth-input-icon" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={19} className="auth-input-icon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
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
            <p className="auth-field-note">Use at least 8 characters.</p>
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={19} className="auth-input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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

          {role === "officer" && (
            <div className="auth-field officer-code-field">
              <label htmlFor="invitationCode">Officer invitation code</label>
              <div className="auth-input-wrap">
                <ShieldCheck size={19} className="auth-input-icon" />
                <input
                  id="invitationCode"
                  type={showInvitationCode ? "text" : "password"}
                  placeholder="Enter your invitation code"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  autoComplete="off"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={
                    showInvitationCode ? "Hide code" : "Show code"
                  }
                  onClick={() =>
                    setShowInvitationCode((value) => !value)
                  }
                >
                  {showInvitationCode ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
              <p className="auth-field-note">
                Only authorized placement officers can register.
              </p>
            </div>
          )}

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-message auth-success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            <span>
              {loading
                ? "Creating account..."
                : role === "officer"
                ? "Create Officer Account"
                : "Create Student Account"}
            </span>
            {!loading && <ArrowRight size={19} />}
          </button>

          <p className="auth-secure-note">
            <ShieldCheck size={16} />
            Your account information is handled securely.
          </p>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}

export default Register;
