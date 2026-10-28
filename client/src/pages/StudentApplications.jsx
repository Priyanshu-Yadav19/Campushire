
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Building2,
  FileText,
  RefreshCw,
} from "lucide-react";
import api from "../services/api";
import "./StudentApplications.css";

function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/my");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data.applications ?? data.data ?? [];

      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your applications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStatusClass = (status) =>
    (status || "Pending").toLowerCase();

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "Date unavailable"
      : parsedDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <main className="student-applications-page">
      <header className="student-applications-header">
        <Link to="/student/dashboard" className="applications-back-link">
          <ArrowLeft size={18} />
          Back to dashboard
        </Link>

        <div className="student-applications-heading">
          <div>
            <span className="applications-eyebrow">
              YOUR CAREER JOURNEY
            </span>
            <h1>My Applications</h1>
            <p>Track the opportunities you've applied for.</p>
          </div>

          <Link
            to="/opportunities"
            className="applications-browse-button"
          >
            <BriefcaseBusiness size={17} />
            Browse opportunities
          </Link>
        </div>
      </header>

      <section className="applications-summary">
        <div className="applications-summary-card">
          <span>Total applications</span>
          <strong>{applications.length}</strong>
        </div>

        <div className="applications-summary-card">
          <span>Pending</span>
          <strong>
            {applications.filter(
              (app) => (app.status || "Pending").toLowerCase() === "pending"
            ).length}
          </strong>
        </div>

        <div className="applications-summary-card">
          <span>Shortlisted</span>
          <strong>
            {applications.filter(
              (app) => app.status?.toLowerCase() === "shortlisted"
            ).length}
          </strong>
        </div>

        <div className="applications-summary-card">
          <span>Selected</span>
          <strong>
            {applications.filter(
              (app) => app.status?.toLowerCase() === "selected"
            ).length}
          </strong>
        </div>
      </section>

      <section className="applications-list-section">
        <div className="applications-list-heading">
          <div>
            <h2>Application history</h2>
            <p>View the current status of each application.</p>
          </div>

          <button
            type="button"
            className="applications-refresh-button"
            onClick={fetchApplications}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="applications-message">
            Loading your applications...
          </div>
        ) : error ? (
          <div className="applications-message applications-error">
            <p>{error}</p>
            <button onClick={fetchApplications}>Try again</button>
          </div>
        ) : applications.length === 0 ? (
          <div className="applications-empty">
            <span className="applications-empty-icon">
              <FileText size={30} />
            </span>
            <h3>No applications yet</h3>
            <p>
              When you apply for an opportunity, it will appear here.
            </p>
            <Link to="/opportunities" className="applications-browse-button">
              Explore opportunities
            </Link>
          </div>
        ) : (
          <div className="student-applications-list">
            {applications.map((app) => {
              const opportunity = app.opportunity || {};
              const status = app.status || "Pending";

              return (
                <article
                  className="student-application-card"
                  key={app._id}
                >
                  <div className="student-application-icon">
                    <Building2 size={24} />
                  </div>

                  <div className="student-application-details">
                    <h3>
                      {opportunity.title || "Opportunity"}
                    </h3>

                    <p className="student-application-company">
                      {opportunity.company || "Company not specified"}
                    </p>

                    <div className="student-application-meta">
                      <span>
                        <BriefcaseBusiness size={15} />
                        {opportunity.type || "Position"}
                      </span>

                      <span>
                        <CalendarDays size={15} />
                        Applied:{" "}
                        {formatDate(app.appliedAt || app.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="student-application-status">
                    <span className={`application-status-badge ${getStatusClass(status)}`}>
                      {status}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default StudentApplications;
