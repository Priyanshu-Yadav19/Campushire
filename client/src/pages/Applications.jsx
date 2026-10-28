
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  LogOut,
  ArrowLeft,
  LoaderCircle,
  Users,
  RefreshCw,
  ExternalLink,
  Download,
} from "lucide-react";
import api from "../services/api";
import "./Applications.css";

const STATUSES = ["Pending", "Shortlisted", "Rejected", "Selected"];

function Applications() {
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [applications, setApplications] = useState([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [resumeLoadingId, setResumeLoadingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOpportunities() {
      try {
        if (!localStorage.getItem("token")) {
          navigate("/login", { replace: true });
          return;
        }

        const userResponse = await api.get("/auth/me");
        const user = userResponse.data.user || userResponse.data;

        if (user.role !== "officer") {
          navigate("/student/dashboard", { replace: true });
          return;
        }

        const response = await api.get("/opportunities");
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data.opportunities || data.data || [];

        if (!active) return;

        setOpportunities(list);

        if (list.length > 0) {
          setSelectedId(list[0]._id);
        }
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load opportunities."
          );
        }
      } finally {
        if (active) setLoadingOpportunities(false);
      }
    }

    loadOpportunities();

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!selectedId) {
      setApplications([]);
      return;
    }

    let active = true;

    async function loadApplications() {
      setLoadingApplications(true);
      setError("");
      setNotice("");

      try {
        const response = await api.get(
          `/applications/opportunity/${selectedId}`
        );

        if (!active) return;

        setApplications(response.data.applications || []);
      } catch (err) {
        if (!active) return;

        setApplications([]);
        setError(
          err.response?.data?.message ||
            "Unable to load applications for this opportunity."
        );
      } finally {
        if (active) setLoadingApplications(false);
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, [selectedId]);

  async function handleResume(studentId, studentName, action) {
    if (!studentId) {
      setError("Student information is unavailable.");
      return;
    }

    const newTab =
      action === "view"
        ? window.open("about:blank", "_blank")
        : null;

    setResumeLoadingId(`${studentId}-${action}`);
    setError("");
    setNotice("");

    try {
      const endpoint =
        action === "view"
          ? `/resumes/${studentId}/view`
          : `/resumes/${studentId}/download`;

      const response = await api.get(endpoint, {
        responseType: "blob",
      });

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const fileUrl = URL.createObjectURL(pdfBlob);

      const safeName = (studentName || "student")
        .replace(/[\\/:*?"<>|]/g, "-")
        .trim();

      if (action === "view") {
        if (newTab && !newTab.closed) {
          newTab.location.href = fileUrl;
        } else {
          const link = document.createElement("a");
          link.href = fileUrl;
          link.download = `${safeName}-resume.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
        }
      } else {
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = `${safeName}-resume.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (err) {
      if (newTab && !newTab.closed) {
        newTab.close();
      }

      setError(
        err.response?.data?.message ||
          "Unable to access this resume. Please try again."
      );
    } finally {
      setResumeLoadingId("");
    }
  }

  async function updateStatus(applicationId, status) {
    const previousApplications = applications;

    setUpdatingId(applicationId);
    setError("");
    setNotice("");

    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status,
      });

      setApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, status }
            : application
        )
      );

      setNotice("Application status updated successfully.");
    } catch (err) {
      setApplications(previousApplications);

      setError(
        err.response?.data?.message ||
          "Unable to update application status."
      );
    } finally {
      setUpdatingId("");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const selectedOpportunity = opportunities.find(
    (item) => item._id === selectedId
  );

  const countByStatus = (status) =>
    applications.filter((item) => item.status === status).length;

  return (
    <div className="applications-layout">
      <aside className="applications-sidebar">
        <Link to="/" className="applications-brand">
          <span className="applications-brand-icon">
            <GraduationCap size={25} />
          </span>

          <span>
            Campus<span>Hire</span>
          </span>
        </Link>

        <p className="applications-sidebar-label">
          OFFICER WORKSPACE
        </p>

        <nav className="applications-nav">
          <Link
            to="/officer/dashboard"
            className="applications-nav-link"
          >
            <LayoutDashboard size={19} />
            Dashboard
          </Link>

          <Link
            to="/officer/opportunities/new"
            className="applications-nav-link"
          >
            <BriefcaseBusiness size={19} />
            Create opportunity
          </Link>

          <Link
            to="/officer/applications"
            className="applications-nav-link active"
          >
            <FileText size={19} />
            Applications
          </Link>
        </nav>

        <button
          className="applications-logout"
          onClick={logout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      <main className="applications-main">
        <header className="applications-topbar">
          <span>Workspace / Applications</span>
          <span className="applications-role">
            Placement Officer
          </span>
        </header>

        <div className="applications-content">
          <Link
            to="/officer/dashboard"
            className="applications-back"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <section className="applications-heading">
            <div>
              <span className="applications-eyebrow">
                PLACEMENT MANAGEMENT
              </span>

              <h1>Student applications</h1>

              <p>
                Review applicants and manage their selection progress.
              </p>
            </div>

            <button
              className="applications-refresh"
              type="button"
              onClick={() => {
                if (selectedId) {
                  setSelectedId("");
                  window.setTimeout(
                    () => setSelectedId(selectedId),
                    0
                  );
                }
              }}
              title="Refresh applications"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </section>

          {error && (
            <div
              className="applications-alert error"
              role="alert"
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              className="applications-alert success"
              role="status"
            >
              {notice}
            </div>
          )}

          <section className="applications-filter">
            <label htmlFor="opportunity-select">
              Select opportunity
            </label>

            {loadingOpportunities ? (
              <p>Loading opportunities...</p>
            ) : opportunities.length === 0 ? (
              <p>
                No opportunities found. Create an opportunity first.
              </p>
            ) : (
              <select
                id="opportunity-select"
                value={selectedId}
                onChange={(event) =>
                  setSelectedId(event.target.value)
                }
              >
                {opportunities.map((opportunity) => (
                  <option
                    key={opportunity._id}
                    value={opportunity._id}
                  >
                    {opportunity.title} — {opportunity.company}
                  </option>
                ))}
              </select>
            )}
          </section>

          <section className="applications-summary">
            <article>
              <Users size={21} />
              <span>Total applications</span>
              <strong>{applications.length}</strong>
            </article>

            <article>
              <span className="summary-dot pending" />
              <span>Pending</span>
              <strong>{countByStatus("Pending")}</strong>
            </article>

            <article>
              <span className="summary-dot shortlisted" />
              <span>Shortlisted</span>
              <strong>{countByStatus("Shortlisted")}</strong>
            </article>

            <article>
              <span className="summary-dot selected" />
              <span>Selected</span>
              <strong>{countByStatus("Selected")}</strong>
            </article>
          </section>

          <section className="applications-panel">
            <div className="applications-panel-heading">
              <div>
                <h2>Applicants</h2>
                <p>
                  {selectedOpportunity?.title ||
                    "Choose an opportunity above"}
                </p>
              </div>
            </div>

            {loadingApplications ? (
              <div className="applications-empty">
                <LoaderCircle
                  className="applications-spinner"
                  size={28}
                />
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="applications-empty">
                <FileText size={34} />

                <h3>No applications to display</h3>

                <p>
                  Applications for this opportunity will appear here
                  when students apply.
                </p>
              </div>
            ) : (
              <div className="applications-table-wrap">
                <table className="applications-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Education</th>
                      <th>CGPA</th>
                      <th>Applied on</th>
                      <th>Resume</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {applications.map((application) => {
                      const student = application.student || {};
                      const studentId =
                        student._id || student.id;

                      const hasResume = Boolean(
                        application.resumeUrl ||
                          student.resumeUrl
                      );

                      const viewingResume =
                        resumeLoadingId === `${studentId}-view`;

                      const downloadingResume =
                        resumeLoadingId ===
                        `${studentId}-download`;

                      return (
                        <tr key={application._id}>
                          <td>
                            <strong>
                              {student.name || "Student"}
                            </strong>

                            <span className="applicant-email">
                              {student.email ||
                                "Email unavailable"}
                            </span>
                          </td>

                          <td>
                            {student.degree || "—"}
                            {student.graduationYear
                              ? ` • ${student.graduationYear}`
                              : ""}
                          </td>

                          <td>{student.cgpa ?? "—"}</td>

                          <td>
                            {application.appliedAt
                              ? new Date(
                                  application.appliedAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td>
                            {hasResume ? (
                              <div className="resume-actions">
                                <button
                                  type="button"
                                  className="applications-resume"
                                  disabled={
                                    viewingResume ||
                                    downloadingResume
                                  }
                                  onClick={() =>
                                    handleResume(
                                      studentId,
                                      student.name,
                                      "view"
                                    )
                                  }
                                >
                                  {viewingResume ? (
                                    <LoaderCircle size={14} />
                                  ) : (
                                    <ExternalLink size={14} />
                                  )}
                                  View
                                </button>

                                <button
                                  type="button"
                                  className="applications-resume"
                                  disabled={
                                    viewingResume ||
                                    downloadingResume
                                  }
                                  onClick={() =>
                                    handleResume(
                                      studentId,
                                      student.name,
                                      "download"
                                    )
                                  }
                                >
                                  {downloadingResume ? (
                                    <LoaderCircle size={14} />
                                  ) : (
                                    <Download size={14} />
                                  )}
                                  Download
                                </button>
                              </div>
                            ) : (
                              "Resume not uploaded"
                            )}
                          </td>

                          <td>
                            <select
                              className={`application-status status-${(
                                application.status || "Pending"
                              ).toLowerCase()}`}
                              value={
                                application.status || "Pending"
                              }
                              disabled={
                                updatingId === application._id
                              }
                              onChange={(event) =>
                                updateStatus(
                                  application._id,
                                  event.target.value
                                )
                              }
                              aria-label={`Update status for ${
                                student.name || "student"
                              }`}
                            >
                              {STATUSES.map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {status}
                                </option>
                              ))}
                            </select>

                            {updatingId === application._id && (
                              <span className="status-saving">
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
        </div>
      </main>
    </div>
  );
}

export default Applications;
