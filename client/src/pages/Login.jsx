
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  UserRound,
  BriefcaseBusiness,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowRight,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../services/api";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState("student");
  const [email, setEmail] = useState(
    location.state?.registeredEmail || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      if (user.role !== role) {
        setError(
          `This account is registered as ${user.role}. Please select the correct role.`
        );
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate(
        user.role === "officer"
          ? "/officer/dashboard"
          : "/student/dashboard",
        { replace: true }
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to sign in. Check your email and password."
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
          <span className="auth-eyebrow">WELCOME TO CAMPUSHIRE</span>
          <h1>Welcome back!</h1>
          <p className="auth-subtitle">
            Sign in to continue your placement journey.
          </p>
        </div>

        <div className="role-options" aria-label="Choose your account role">
          <button
            type="button"
            className={`role-option ${
              role === "student" ? "active" : ""
            }`}
            onClick={() => {
              setRole("student");
              setError("");
            }}
            aria-pressed={role === "student"}
          >
            <UserRound size={21} />
            <span>Student</span>
            {role === "student" && (
              <span className="role-check">✓</span>
            )}
          </button>

          <button
            type="button"
            className={`role-option ${
              role === "officer" ? "active" : ""
            }`}
            onClick={() => {
              setRole("officer");
              setError("");
            }}
            aria-pressed={role === "officer"}
          >
            <BriefcaseBusiness size={21} />
            <span>Placement Officer</span>
            {role === "officer" && (
              <span className="role-check">✓</span>
            )}
          </button>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={19} className="auth-input-icon" />
              <input
                id="login-email"
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

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={19} className="auth-input-icon" />
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
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
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
         
          </div>

          <div className="auth-forgot-password">
            <Link to="/forgot-password">Forgot password?</Link>
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
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>
                  Sign in as {role === "student" ? "Student" : "Officer"}
                </span>
                <ArrowRight size={19} />
              </>
            )}
          </button>

          <p className="auth-secure-note">
            <ShieldCheck size={16} />
            Secure sign-in to your CampusHire account
          </p>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </section>
    </main>
  );
}

export default Login;
