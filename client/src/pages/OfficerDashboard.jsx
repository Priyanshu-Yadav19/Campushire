
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Users,
  LogOut,
  Plus,
  Clock3,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  ArrowUpRight,
} from "lucide-react";
import api from "../services/api";
import "./OfficerDashboard.css";

function OfficerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [opportunities, setOpportunities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [userResponse, opportunityResponse] = await Promise.all([
          api.get("/auth/me"),
          api.get("/opportunities/my"),
        ]);

        if (!active) return;

        const currentUser =
          userResponse.data.user || userResponse.data;

        if (currentUser.role !== "officer") {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));

        const opportunityData = opportunityResponse.data;
        const opportunityList = Array.isArray(opportunityData)
          ? opportunityData
          : opportunityData.opportunities ||
            opportunityData.data ||
            [];

        setOpportunities(opportunityList);

        // Load applications for opportunities belonging to this officer.
        // The backend verifies ownership on each request.
        const ownedOpportunities = opportunityList.filter((item) => {
          const owner = item.createdBy?._id || item.createdBy;
          return owner && String(owner) === String(currentUser._id || currentUser.id);
        });

        const applicationResults = await Promise.allSettled(
          ownedOpportunities.map((item) =>
            api.get(`/applications/opportunity/${item._id}`)
          )
        );

        if (!active) return;

        const allApplications = applicationResults.flatMap((result) => {
          if (result.status !== "fulfilled") return [];

          const data = result.value.data;
          return Array.isArray(data)
            ? data
            : data.applications || data.data || [];
        });

        setApplications(allApplications);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load dashboard data. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [navigate]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  async function updateOpportunityStatus(opportunityId, newStatus) {
    const previousOpportunities = opportunities;

    setError("");
    setSuccess("");
    setUpdatingId(opportunityId);

    // Optimistic UI update: revert if the API request fails.
    setOpportunities((current) =>
      current.map((item) =>
        item._id === opportunityId
          ? { ...item, status: newStatus }
          : item
      )
    );

    try {
      const response = await api.patch(
        `/opportunities/${opportunityId}/status`,
        { status: newStatus }
      );

      const updatedOpportunity =
        response.data.opportunity || response.data.data || response.data;

      setOpportunities((current) =>
        current.map((item) =>
          item._id === opportunityId
            ? {
                ...item,
                ...(updatedOpportunity._id ? updatedOpportunity : {}),
                status: updatedOpportunity.status || newStatus,
              }
            : item
        )
      );

      setSuccess(
        `Opportunity status changed to ${newStatus}.`
      );
    } catch (err) {
      setOpportunities(previousOpportunities);
      setError(
        err.response?.data?.message ||
          "Could not update status. Check that the backend status route exists."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "Officer";

  const openOpportunities = opportunities.filter(
    (item) => String(item.status || "Open").toLowerCase() === "open"
  ).length;

  const shortlisted = applications.filter((item) =>
    ["shortlisted", "selected", "accepted"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="officer-layout">
      <aside className="officer-sidebar">
        <Link to="/" className="officer-brand">
          <span className="officer-brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            Campus<span>Hire</span>
          </span>
        </Link>

        <p className="officer-sidebar-label">OFFICER WORKSPACE</p>

        <nav className="officer-nav">
          <Link
            to="/officer/dashboard"
            className="officer-nav-link active"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/officer/opportunities/new"
            className="officer-nav-link"
          >
            <Plus size={19} />
            Create opportunity
          </Link>

          <Link
            to="/officer/applications"
            className="officer-nav-link"
          >
            <FileText size={19} />
            Applications
          </Link>
        </nav>

        <div className="officer-sidebar-bottom">
          <div className="officer-help-card">
            <Users size={24} />
            <strong>Manage placements</strong>
            <p>
              Keep opportunities organized and review student progress.
            </p>
          </div>

          <button className="officer-logout" onClick={logout}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="officer-main">
        <header className="officer-topbar">
          <div>
            <span className="officer-breadcrumb">
              Workspace / Dashboard
            </span>
          </div>

          <div className="officer-user">
            <div className="officer-avatar">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user?.name || "Placement Officer"}</strong>
              <span>Placement Officer</span>
            </div>
          </div>
        </header>

        <div className="officer-content">
          <section className="officer-welcome">
            <div>
              <span className="officer-eyebrow">
                PLACEMENT MANAGEMENT
              </span>
              <h1>Welcome back, {firstName}!</h1>
              <p>
                Manage opportunities and keep track of student applications.
              </p>
            </div>

            <Link
              to="/officer/opportunities/new"
              className="officer-primary-button"
            >
              <Plus size={18} />
              Create opportunity
            </Link>
          </section>

          {error && (
            <div className="officer-error" role="alert">
              {error}
              <button onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          )}

          {success && (
            <div className="officer-success" role="status">
              {success}
            </div>
          )}

          <section className="officer-stats">
            <article className="officer-stat-card">
              <span className="officer-stat-icon blue">
                <BriefcaseBusiness size={22} />
              </span>
              <p>Total opportunities</p>
              <strong>{loading ? "—" : opportunities.length}</strong>
              <span className="officer-stat-note">
                All listed opportunities
              </span>
            </article>

            <article className="officer-stat-card">
              <span className="officer-stat-icon green">
                <CheckCircle2 size={22} />
              </span>
              <p>Open opportunities</p>
              <strong>{loading ? "—" : openOpportunities}</strong>
              <span className="officer-stat-note">
                Currently accepting applications
              </span>
            </article>

            <article className="officer-stat-card">
              <span className="officer-stat-icon purple">
                <Users size={22} />
              </span>
              <p>Applications received</p>
              <strong>{loading ? "—" : applications.length}</strong>
              <span className="officer-stat-note">
                Applications available to review
              </span>
            </article>

            <article className="officer-stat-card">
              <span className="officer-stat-icon orange">
                <Clock3 size={22} />
              </span>
              <p>Positive progress</p>
              <strong>{loading ? "—" : shortlisted}</strong>
              <span className="officer-stat-note">
                Shortlisted or selected
              </span>
            </article>
          </section>

          <section className="officer-panel">
            <div className="officer-panel-heading">
              <div>
                <h2>Manage opportunities</h2>
                <p>
                  Change whether students can apply for each opportunity.
                </p>
              </div>

              <Link to="/officer/opportunities/new">
                Create new <ArrowUpRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="officer-loading">
                <LoaderCircle size={24} className="officer-spinner" />
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="officer-empty">
                <BriefcaseBusiness size={30} />
                <h3>No opportunities found</h3>
                <p>
                  Create your first listing to start organizing placements.
                </p>
                <Link
                  to="/officer/opportunities/new"
                  className="officer-primary-button"
                >
                  <Plus size={17} />
                  Create opportunity
                </Link>
              </div>
            ) : (
              <div className="officer-table-wrap">
                <table className="officer-table">
                  <thead>
                    <tr>
                      <th>Opportunity</th>
                      <th>Company</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Manage status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {opportunities.slice(0, 6).map((item) => {
                      const isOpen =
                        String(item.status || "Open").toLowerCase() ===
                        "open";

                      return (
                        <tr key={item._id}>
                          <td>
                            <strong>
                              {item.title || "Untitled role"}
                            </strong>
                          </td>

                          <td>{item.company || "—"}</td>
                          <td>{item.location || "Not specified"}</td>

                          <td>
                            <span
                              className={`officer-status ${
                                isOpen ? "is-open" : "is-closed"
                              }`}
                            >
                              {isOpen ? (
                                <CheckCircle2 size={14} />
                              ) : (
                                <XCircle size={14} />
                              )}
                              {isOpen ? "Open" : "Closed"}
                            </span>
                          </td>

                          <td>
                            <select
                              aria-label={`Change status for ${item.title || "opportunity"}`}
                              value={isOpen ? "Open" : "Closed"}
                              onChange={(event) =>
                                updateOpportunityStatus(
                                  item._id,
                                  event.target.value
                                )
                              }
                              disabled={updatingId === item._id}
                            >
                              <option value="Open">Open</option>
                              <option value="Closed">Closed</option>
                            </select>

                            {updatingId === item._id && (
                              <span className="officer-status-saving">
                                Saving...
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="officer-footer">
            <span>© 2026 CampusHire</span>
            <span>Placement management, made simpler.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default OfficerDashboard;
