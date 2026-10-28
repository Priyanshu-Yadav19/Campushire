
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  UserRound,
  LogOut,
  Bell,
  Search,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [userResponse, applicationResponse] = await Promise.all([
        api.get("/auth/me"),
        api.get("/applications/my"),
      ]);

      const currentUser = userResponse.data.user || userResponse.data;
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));

      const result = applicationResponse.data;
      const list = Array.isArray(result)
        ? result
        : result.applications || result.data || [];

      const sortedApplications = [...list].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setApplications(sortedApplications);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    loadDashboard();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const statusInfo = (status) => {
    const value = String(status || "Pending").toLowerCase();

    if (value === "shortlisted") {
      return {
        label: "Shortlisted",
        icon: CheckCircle2,
        className: "status-shortlisted",
      };
    }

    if (value === "rejected") {
      return {
        label: "Rejected",
        icon: XCircle,
        className: "status-rejected",
      };
    }

    if (value === "selected" || value === "accepted") {
      return {
        label: "Selected",
        icon: CheckCircle2,
        className: "status-selected",
      };
    }

    return {
      label: "Pending",
      icon: Clock3,
      className: "status-pending",
    };
  };

  const getOpportunity = (application) => {
    const opportunity = application.opportunity || application.opportunityId;

    return typeof opportunity === "object" && opportunity !== null
      ? opportunity
      : {};
  };

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || "Student";

  const shortlistedCount = applications.filter(
    (application) =>
      String(application.status || "").toLowerCase() === "shortlisted"
  ).length;

  const pendingCount = applications.filter(
    (application) =>
      String(application.status || "pending").toLowerCase() === "pending"
  ).length;

  const recentApplications = applications.slice(0, 3);

  return (
    <div className="student-layout">
      {mobileMenu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`student-sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <Link
          to="/student/dashboard"
          className="dashboard-brand"
          onClick={() => setMobileMenu(false)}
        >
          <span className="dashboard-brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            Campus<span>Hire</span>
          </span>
        </Link>

        <div className="sidebar-section-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <Link
            to="/student/dashboard"
            className="sidebar-link sidebar-link-active"
            onClick={() => setMobileMenu(false)}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/opportunities"
            className="sidebar-link"
            onClick={() => setMobileMenu(false)}
          >
            <BriefcaseBusiness size={19} />
            Opportunities
          </Link>

          <Link
            to="/applications"
            className="sidebar-link"
            onClick={() => setMobileMenu(false)}
          >
            <FileText size={19} />
            My applications
          </Link>

          <Link
            to="/profile"
            className="sidebar-link"
            onClick={() => setMobileMenu(false)}
          >
            <UserRound size={19} />
            My profile
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">
              <GraduationCap size={21} />
            </div>
            <strong>Keep moving forward</strong>
            <p>
              Keep your profile updated and explore new opportunities.
            </p>
            <Link
              to="/opportunities"
              onClick={() => setMobileMenu(false)}
            >
              Explore jobs <ArrowUpRight size={15} />
            </Link>
          </div>

          <button className="sidebar-logout" onClick={logout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="student-main">
        <header className="dashboard-topbar">
          <button
            className="mobile-menu-toggle"
            aria-label="Open navigation"
            onClick={() => setMobileMenu(true)}
          >
            <Menu size={22} />
          </button>

          <div className="topbar-breadcrumb">
            Workspace <span>/</span> Dashboard
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="View all applications"
              title="View all applications"
              onClick={() => navigate("/applications")}
            >
              <Bell size={19} />
            </button>

            <div className="topbar-user">
              <div className="user-avatar">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div className="topbar-user-info">
                <strong>{user?.name || "Student"}</strong>
                <span>Student account</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <span className="dashboard-eyebrow">
                STUDENT WORKSPACE
              </span>
              <h1>Welcome back, {firstName}!</h1>
              <p>
                Here's an overview of your placement journey. Keep up the
                momentum.
              </p>
            </div>

            <Link
              to="/opportunities"
              className="dashboard-primary-button"
            >
              <Search size={18} />
              Explore opportunities
              <ArrowUpRight size={17} />
            </Link>
          </section>

          {error && (
            <div className="dashboard-error" role="alert">
              <p>{error}</p>
              <button
                onClick={loadDashboard}
                className="dashboard-retry"
                disabled={loading}
              >
                <RefreshCw size={15} />
                Retry
              </button>
            </div>
          )}

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <div className="stat-card-top">
                <span className="stat-icon stat-icon-blue">
                  <FileText size={21} />
                </span>
                <span className="stat-label">Total applications</span>
              </div>
              <div className="stat-value">
                {loading ? "—" : applications.length}
              </div>
              <p>Applications submitted</p>
            </article>

            <article className="dashboard-stat-card">
              <div className="stat-card-top">
                <span className="stat-icon stat-icon-green">
                  <CheckCircle2 size={21} />
                </span>
                <span className="stat-label">Shortlisted</span>
              </div>
              <div className="stat-value">
                {loading ? "—" : shortlistedCount}
              </div>
              <p>Applications shortlisted</p>
            </article>

            <article className="dashboard-stat-card">
              <div className="stat-card-top">
                <span className="stat-icon stat-icon-orange">
                  <Clock3 size={21} />
                </span>
                <span className="stat-label">Awaiting response</span>
              </div>
              <div className="stat-value">
                {loading ? "—" : pendingCount}
              </div>
              <p>Pending applications</p>
            </article>
          </section>

          <section className="applications-panel" id="applications">
            <div className="panel-heading">
              <div>
                <h2>Recent applications</h2>
                <p>
                  Here's the latest activity from your applications.
                </p>
              </div>

              <Link to="/applications" className="panel-link">
                View all applications
                <ArrowRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="dashboard-loading">
                <LoaderCircle size={25} className="auth-spinner" />
                <span>Loading your applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="dashboard-empty">
                <div className="empty-icon">
                  <BriefcaseBusiness size={26} />
                </div>
                <h3>Your journey starts here</h3>
                <p>
                  You haven't applied to any opportunities yet. Find a role
                  that matches your skills and take the first step.
                </p>
                <Link
                  to="/opportunities"
                  className="dashboard-primary-button"
                >
                  Browse opportunities
                  <ArrowRight size={17} />
                </Link>
              </div>
            ) : (
              <div className="application-table-wrap">
                <table className="application-table">
                  <thead>
                    <tr>
                      <th>Opportunity</th>
                      <th>Company</th>
                      <th>Date applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((application) => {
                      const opportunity = getOpportunity(application);
                      const status = statusInfo(application.status);
                      const StatusIcon = status.icon;

                      return (
                        <tr key={application._id}>
                          <td>
                            <strong>
                              {opportunity.title || "Opportunity"}
                            </strong>
                          </td>
                          <td>
                            {opportunity.company || "Company not available"}
                          </td>
                          <td>
                            {application.createdAt
                              ? new Date(
                                  application.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>
                          <td>
                            <span
                              className={`application-status ${status.className}`}
                            >
                              <StatusIcon size={14} />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {applications.length > 3 && (
                  <div className="recent-applications-footer">
                    <span>
                      Showing 3 of {applications.length} applications
                    </span>
                    <Link to="/applications">
                      See all <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>© 2026 CampusHire</span>
            <span>One step closer to your next opportunity.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
