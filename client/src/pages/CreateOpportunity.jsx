
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Send,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import "./CreateOpportunity.css";

const initialForm = {
  title: "Software Developer Intern",
  company: "Example Technologies",
  type: "Internship",
  location: "Ahmedabad, Gujarat",
  salary: "15000",
  minCGPA: "7",
  eligibleDegrees: "BSc Computer Science, MSc Computer Applications",
  graduationYears: "2027",
  requiredSkills: "Python, SQL",
  applicationDeadline: "2026-12-31",
  description:
    "Work on software development tasks, APIs, testing, and database operations.",
};

function CreateOpportunity() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      if (user.role !== "officer") {
        setError("Only placement officers can create opportunities.");
        return;
      }
    } catch {
      setError("Your login session is invalid. Please sign in again.");
      return;
    }

    const salary = Number(form.salary);
    const minCGPA = Number(form.minCGPA);

    if (!Number.isFinite(salary) || salary < 0) {
      setError("Enter a valid salary or stipend amount.");
      return;
    }

    if (!Number.isFinite(minCGPA) || minCGPA < 0 || minCGPA > 10) {
      setError("Minimum CGPA must be between 0 and 10.");
      return;
    }

    const graduationYears = form.graduationYears
      .split(",")
      .map((year) => Number(year.trim()))
      .filter((year) => Number.isInteger(year) && year > 1900);

    if (graduationYears.length === 0) {
      setError("Enter at least one valid graduation year.");
      return;
    }

    const eligibleDegrees = form.eligibleDegrees
      .split(",")
      .map((degree) => degree.trim())
      .filter(Boolean);

    const requiredSkills = form.requiredSkills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    if (eligibleDegrees.length === 0 || requiredSkills.length === 0) {
      setError("Enter at least one eligible degree and required skill.");
      return;
    }

    if (new Date(form.applicationDeadline) < new Date(new Date().toDateString())) {
      setError("The application deadline cannot be in the past.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      type: form.type,
      location: form.location.trim(),
      salary,
      minCGPA,
      eligibleDegrees,
      graduationYears,
      requiredSkills,
      applicationDeadline: form.applicationDeadline,
      description: form.description.trim(),
      status: "Open",
    };

    setLoading(true);

    try {
      await api.post("/opportunities", payload);
      setSuccess("Opportunity created successfully!");

      setTimeout(() => {
        navigate("/officer/dashboard", { replace: true });
      }, 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not create the opportunity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-opportunity-page">
      <div className="create-opportunity-container">
        <Link to="/officer/dashboard" className="create-back-link">
          <ArrowLeft size={18} />
          Back to officer dashboard
        </Link>

        <header className="create-page-heading">
          <div className="create-heading-icon">
            <BriefcaseBusiness size={26} />
          </div>
          <div>
            <p className="create-eyebrow">OPPORTUNITY MANAGEMENT</p>
            <h1>Create an opportunity</h1>
            <p>
              Share a placement or internship with eligible students.
            </p>
          </div>
        </header>

        <form className="opportunity-form" onSubmit={handleSubmit}>
          <section className="opportunity-form-section">
            <div className="form-section-heading">
              <Building2 size={20} />
              <div>
                <h2>Basic information</h2>
                <p>Tell students about the role and company.</p>
              </div>
            </div>

            <div className="create-form-grid">
              <div className="create-field create-field-full">
                <label htmlFor="title">Job title *</label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="e.g. Software Developer Intern"
                  required
                  maxLength={120}
                />
              </div>

              <div className="create-field">
                <label htmlFor="company">Company name *</label>
                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={updateField}
                  placeholder="Company name"
                  required
                  maxLength={120}
                />
              </div>

              <div className="create-field">
                <label htmlFor="type">Opportunity type *</label>
                <select
                  id="type"
                  name="type"
                  value={form.type}
                  onChange={updateField}
                  required
                >
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div className="create-field">
                <label htmlFor="location">Location *</label>
                <div className="create-input-with-icon">
                  <MapPin size={18} />
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={updateField}
                    placeholder="e.g. Surat, Gujarat or Remote"
                    required
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="create-field">
                <label htmlFor="salary">Monthly salary / stipend (₹) *</label>
                <input
                  id="salary"
                  name="salary"
                  type="number"
                  min="0"
                  value={form.salary}
                  onChange={updateField}
                  placeholder="15000"
                  required
                />
              </div>

              <div className="create-field create-field-full">
                <label htmlFor="description">Job description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Describe responsibilities and what the student will do."
                  rows={5}
                  required
                  maxLength={5000}
                />
              </div>
            </div>
          </section>

          <section className="opportunity-form-section">
            <div className="form-section-heading">
              <GraduationCap size={21} />
              <div>
                <h2>Eligibility requirements</h2>
                <p>Specify who can apply for this opportunity.</p>
              </div>
            </div>

            <div className="create-form-grid">
              <div className="create-field">
                <label htmlFor="minCGPA">Minimum CGPA (out of 10) *</label>
                <input
                  id="minCGPA"
                  name="minCGPA"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={form.minCGPA}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="create-field">
                <label htmlFor="graduationYears">Graduation years *</label>
                <input
                  id="graduationYears"
                  name="graduationYears"
                  value={form.graduationYears}
                  onChange={updateField}
                  placeholder="2027, 2028"
                  required
                />
                <small>Separate multiple years with commas.</small>
              </div>

              <div className="create-field">
                <label htmlFor="eligibleDegrees">Eligible degrees *</label>
                <input
                  id="eligibleDegrees"
                  name="eligibleDegrees"
                  value={form.eligibleDegrees}
                  onChange={updateField}
                  placeholder="BSc Computer Science, MSc CA"
                  required
                />
                <small>Separate multiple degrees with commas.</small>
              </div>

              <div className="create-field">
                <label htmlFor="requiredSkills">Required skills *</label>
                <input
                  id="requiredSkills"
                  name="requiredSkills"
                  value={form.requiredSkills}
                  onChange={updateField}
                  placeholder="Python, SQL, React"
                  required
                />
                <small>Separate skills with commas.</small>
              </div>
            </div>
          </section>

          <section className="opportunity-form-section">
            <div className="form-section-heading">
              <CalendarDays size={21} />
              <div>
                <h2>Application deadline</h2>
                <p>Students should apply before this date.</p>
              </div>
            </div>

            <div className="create-field create-deadline-field">
              <label htmlFor="applicationDeadline">Last date to apply *</label>
              <input
                id="applicationDeadline"
                name="applicationDeadline"
                type="date"
                value={form.applicationDeadline}
                onChange={updateField}
                min={new Date().toLocaleDateString("en-CA")}
                required
              />
            </div>
          </section>

          {error && (
            <div className="create-alert create-alert-error" role="alert">
              <XCircle size={19} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="create-alert create-alert-success" role="status">
              <CheckCircle2 size={19} />
              <span>{success}</span>
            </div>
          )}

          <footer className="create-form-footer">
            <Link to="/officer/dashboard" className="create-cancel-button">
              Cancel
            </Link>
            <button
              type="submit"
              className="create-publish-button"
              disabled={loading}
            >
              {loading ? (
                "Publishing..."
              ) : (
                <>
                  <Send size={17} />
                  Publish opportunity
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </main>
  );
}

export default CreateOpportunity;
