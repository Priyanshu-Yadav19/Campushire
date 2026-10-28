import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  BriefcaseBusiness,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import "./Opportunities.css";

export default function Opportunities() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = Boolean(token);
  const isStudent = user?.role === "student";

  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [applyingId, setApplyingId] = useState(null);
  const [appliedIds, setAppliedIds] = useState([]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await api.get("/opportunities");
        const data = response.data;

        const items = Array.isArray(data)
          ? data
          : data.opportunities || data.data || [];

        setOpportunities(items);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load opportunities. Check that the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  useEffect(() => {
    if (!token || !isStudent) return;

    const fetchMyApplications = async () => {
      try {
        const response = await api.get("/applications/my");
        const data = response.data;

        const applications = Array.isArray(data)
          ? data
          : data.applications || data.data || [];

        const ids = applications
          .map((application) => {
            const opportunity =
              application.opportunityId ?? application.opportunity;

            if (opportunity && typeof opportunity === "object") {
              return opportunity._id;
            }

            return opportunity;
          })
          .filter(Boolean)
          .map(String);

        setAppliedIds(ids);
      } catch (err) {
        console.error("Unable to load applications:", err);
      }
    };

    fetchMyApplications();
  }, [token, isStudent]);

  const filteredOpportunities = opportunities.filter((job) => {
    const text = `${job.title || ""} ${job.company || ""} ${
      job.location || ""
    } ${job.type || job.employmentType || ""}`.toLowerCase();

    return text.includes(search.trim().toLowerCase());
  });

  const handleApply = async (job) => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!isStudent) {
      setMessage("Only student accounts can apply for opportunities.");
      return;
    }

    const opportunityId = String(job._id);
    const isClosed =
      String(job.status || "Open").toLowerCase() === "closed";

    if (isClosed) {
      setMessage("This opportunity is closed and no longer accepting applications.");
      return;
    }

    if (appliedIds.includes(opportunityId)) {
      return;
    }

    setApplyingId(opportunityId);
    setMessage("");

    try {
      await api.post("/applications", {
        opportunityId: job._id,
      });

      setAppliedIds((previous) =>
        previous.includes(opportunityId)
          ? previous
          : [...previous, opportunityId]
      );

      setMessage(`Successfully applied for ${job.title}.`);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Application failed. Check your profile and eligibility, then try again."
      );
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <main className="opportunities-page">
      <div className="opportunities-container">
        <Link to="/student/dashboard" className="opportunities-back">
          ← Back to dashboard
        </Link>

        <div className="opportunities-heading">
          <div>
            <span className="opportunities-kicker">
              CAREER OPPORTUNITIES
            </span>
            <h1>Explore opportunities</h1>
            <p>Find internships and jobs that match your skills.</p>
          </div>
        </div>

        <input
          className="opportunities-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title, company or location"
          aria-label="Search opportunities"
        />

        {loading && (
          <p className="opportunities-message">
            Loading opportunities...
          </p>
        )}

        {error && (
          <p className="opportunities-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="opportunities-message" role="status">
            {message}
          </p>
        )}

        {!loading && !error && filteredOpportunities.length === 0 && (
          <p className="opportunities-message">
            No opportunities found. Try another search.
          </p>
        )}

        <div className="opportunities-grid">
          {filteredOpportunities.map((job) => {
            const opportunityId = String(job._id);
            const alreadyApplied = appliedIds.includes(opportunityId);
            const isClosed =
              String(job.status || "Open").toLowerCase() === "closed";

            const requiredSkills = Array.isArray(job.requiredSkills)
              ? job.requiredSkills
              : [];

            return (
              <article className="opportunity-item" key={job._id}>
                <div className="opportunity-item-top">
                  <span className="opportunity-item-icon">
                    <BriefcaseBusiness size={23} />
                  </span>

                  <span className="opportunity-item-type">
                    {job.type || job.employmentType || "Opportunity"}
                  </span>
                </div>

                <h2>{job.title || "Untitled opportunity"}</h2>

                <p className="opportunity-company">
                  {job.company || "Company not specified"}
                </p>

                <p className="opportunity-detail">
                  <MapPin size={15} style={{ verticalAlign: "middle" }} />{" "}
                  {job.location || "Location not specified"}
                </p>

                {job.stipend && (
                  <p className="opportunity-detail">
                    Stipend: {job.stipend}
                  </p>
                )}

                {requiredSkills.length > 0 && (
                  <div className="opportunity-skills">
                    {requiredSkills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                )}

                <div className="opportunity-eligibility">
                  <h3>Eligibility requirements</h3>

                  <p>
                    <strong>Degree:</strong>{" "}
                    {Array.isArray(job.eligibleDegrees) &&
                    job.eligibleDegrees.length > 0
                      ? job.eligibleDegrees.join(", ")
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Graduation year:</strong>{" "}
                    {Array.isArray(job.graduationYears) &&
                    job.graduationYears.length > 0
                      ? job.graduationYears.join(", ")
                      : "Not specified"}
                  </p>

                  <p>
                    <strong>Minimum CGPA:</strong>{" "}
                    {job.minCGPA ?? "Not specified"}
                  </p>
                </div>

                <button
                  type="button"
                  className="opportunity-apply"
                  onClick={() => handleApply(job)}
                  disabled={
                    applyingId === opportunityId ||
                    alreadyApplied ||
                    isClosed
                  }
                >
                  {alreadyApplied ? (
                    <>
                      <CheckCircle2
                        size={16}
                        style={{ verticalAlign: "middle" }}
                      />{" "}
                      Already applied
                    </>
                  ) : applyingId === opportunityId ? (
                    "Applying..."
                  ) : isClosed ? (
                    "Closed"
                  ) : !isLoggedIn ? (
                    "Login to apply"
                  ) : !isStudent ? (
                    "Students only"
                  ) : (
                    "Apply now"
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}