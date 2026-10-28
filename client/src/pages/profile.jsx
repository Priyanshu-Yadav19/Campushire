
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  UserRound,
  LogOut,
  Menu,
  ArrowLeft,
  Save,
  Pencil,
  X,
  LoaderCircle,
  Mail,
  GraduationCap as EducationIcon,
  Code2,
  CalendarDays,
  Award,
  Upload,
  ExternalLink,
  FileCheck2,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    degree: "",
    graduationYear: "",
    cgpa: "",
    skills: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewingResume, setViewingResume] = useState(false);
  const [editing, setEditing] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Clear success and error notifications after 3 seconds.
  useEffect(() => {
    if (!message && !error) return;

    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, error]);

  // Load the latest profile from the backend.
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;

    const loadProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        if (!active) return;

        const profile = response.data.user || response.data;

        setUser(profile);

        setFormData({
          name: profile.name || "",
          degree: profile.degree || "",
          graduationYear: profile.graduationYear ?? "",
          cgpa: profile.cgpa ?? "",
          skills: Array.isArray(profile.skills)
            ? profile.skills.join(", ")
            : profile.skills || "",
        });

        localStorage.setItem("user", JSON.stringify(profile));
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please try again."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      degree: user?.degree || "",
      graduationYear: user?.graduationYear ?? "",
      cgpa: user?.cgpa ?? "",
      skills: Array.isArray(user?.skills)
        ? user.skills.join(", ")
        : user?.skills || "",
    });

    setEditing(false);
    setError("");
    setMessage("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!formData.name.trim()) {
      setError("Please enter your name.");
      return;
    }

    const cgpaValue =
      formData.cgpa === "" ? "" : Number(formData.cgpa);

    if (
      cgpaValue !== "" &&
      (!Number.isFinite(cgpaValue) ||
        cgpaValue < 0 ||
        cgpaValue > 10)
    ) {
      setError("CGPA must be between 0 and 10.");
      return;
    }

    const yearValue =
      formData.graduationYear === ""
        ? ""
        : Number(formData.graduationYear);

    if (
      yearValue !== "" &&
      (!Number.isInteger(yearValue) ||
        yearValue < 2000 ||
        yearValue > 2100)
    ) {
      setError("Please enter a valid graduation year.");
      return;
    }

    const updatedProfile = {
      name: formData.name.trim(),
      degree: formData.degree.trim(),
      graduationYear: yearValue,
      cgpa: cgpaValue,
      skills: formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    };

    try {
      setSaving(true);

      const response = await api.put("/auth/me", updatedProfile);
      const savedUser = response.data.user || response.data;

      const updatedUser = {
        ...user,
        ...updatedProfile,
        ...savedUser,
      };

      setUser(updatedUser);

      setFormData({
        name: updatedUser.name || "",
        degree: updatedUser.degree || "",
        graduationYear: updatedUser.graduationYear ?? "",
        cgpa: updatedUser.cgpa ?? "",
        skills: Array.isArray(updatedUser.skills)
          ? updatedUser.skills.join(", ")
          : updatedUser.skills || "",
      });

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setEditing(false);
      setMessage("Your profile has been updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleResumeSelection = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) return;

    if (
      file.type !== "application/pdf" ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setSelectedResume(null);
      event.target.value = "";
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedResume(null);
      event.target.value = "";
      setError("Your resume must be 5 MB or smaller.");
      return;
    }

    setSelectedResume(file);
  };

  const handleResumeUpload = async (event) => {
    event.preventDefault();

    if (!selectedResume) {
      setError("Please choose a PDF resume first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const data = new FormData();
    data.append("resume", selectedResume);

    try {
      const response = await api.post("/resumes/upload", data);

      const resumeUrl =
        response.data.resumeUrl || user?.resumeUrl || "mongodb";

      const updatedUser = {
        ...user,
        resumeUrl,
      };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSelectedResume(null);

      const fileInput = document.getElementById(
        "profile-resume-file"
      );

      if (fileInput) fileInput.value = "";

      setMessage("Resume uploaded successfully.");
    } catch (err) {
      console.error(
        "Resume upload failed:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Unable to upload your resume. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleViewResume = async () => {
    const studentId = user?._id || user?.id;

    if (!studentId || !user?.resumeUrl) {
      setError(
        "Resume or student ID is missing. Please reload your profile."
      );
      return;
    }

    const newTab = window.open("about:blank", "_blank");

    if (!newTab) {
      setError("Please allow pop-ups to view your resume.");
      return;
    }

    setViewingResume(true);
    setError("");
    setMessage("");

    try {
      const response = await api.get(
        `/resumes/${studentId}/view`,
        { responseType: "blob" }
      );

      const pdfBlob = new Blob([response.data], {
        type: "application/pdf",
      });

      const pdfUrl = URL.createObjectURL(pdfBlob);
      newTab.location.href = pdfUrl;

      setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
    } catch (err) {
      console.error(
        "Unable to view resume:",
        err.response?.status,
        err.response?.data || err
      );

      newTab.close();

      setError(
        err.response?.status === 404
          ? "Resume not found. Please upload your resume again."
          : err.response?.status === 401
            ? "Your session may have expired. Please log in again."
            : err.response?.status === 403
              ? "You don't have permission to view this resume."
              : "Unable to open your resume. Please try again."
      );
    } finally {
      setViewingResume(false);
    }
  };

  const firstName =
    user?.name?.trim()?.split(/\s+/)[0] || "Student";

  const displayedSkills = editing
    ? formData.skills.split(",")
    : Array.isArray(user?.skills)
      ? user.skills
      : typeof user?.skills === "string"
        ? user.skills.split(",")
        : [];

  const skills = displayedSkills
    .map((skill) => String(skill).trim())
    .filter(Boolean);

  return (
    <div className="student-layout">
      {mobileMenu && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside
        className={`student-sidebar ${
          mobileMenu ? "sidebar-open" : ""
        }`}
      >
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
            className="sidebar-link"
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
            className="sidebar-link sidebar-link-active"
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
            <strong>Build your profile</strong>
            <p>
              Keep your academic details and skills up to date.
            </p>
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
            Workspace <span>/</span> My Profile
          </div>

          <div className="topbar-actions">
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

        <div className="profile-content">
          <Link
            to="/student/dashboard"
            className="profile-back-link"
          >
            <ArrowLeft size={17} />
            Back to dashboard
          </Link>

          <section className="profile-welcome">
            <div>
              <span className="dashboard-eyebrow">
                YOUR ACCOUNT
              </span>
              <h1>My Profile</h1>
              <p>
                Manage your personal information, education and skills.
              </p>
            </div>

            {!loading && user && !editing && (
              <button
                className="profile-primary-button"
                onClick={() => {
                  setEditing(true);
                  setMessage("");
                  setError("");
                }}
              >
                <Pencil size={17} />
                Edit profile
              </button>
            )}
          </section>

          {/* Floating toast notifications */}
          {(error || message) && (
            <div
              className={`profile-toast ${
                error
                  ? "profile-toast-error"
                  : "profile-toast-success"
              }`}
              role={error ? "alert" : "status"}
              aria-live={error ? "assertive" : "polite"}
            >
              <span className="profile-toast-icon">
                {error ? "!" : "✓"}
              </span>

              <span className="profile-toast-message">
                {error || message}
              </span>

              <button
                type="button"
                className="profile-toast-close"
                aria-label="Dismiss notification"
                onClick={() => {
                  setError("");
                  setMessage("");
                }}
              >
                ×
              </button>
            </div>
          )}

          {loading ? (
            <div className="profile-loading">
              <LoaderCircle size={27} className="auth-spinner" />
              <span>Loading your profile...</span>
            </div>
          ) : user ? (
            <>
              <form
                className="profile-grid"
                onSubmit={handleSave}
              >
                <section className="profile-card profile-summary-card">
                  <div className="profile-avatar">
                    {firstName.charAt(0).toUpperCase()}
                  </div>

                  <h2>{formData.name || "Student"}</h2>
                  <p className="profile-role">Student account</p>

                  <div className="profile-summary-divider" />

                  <div className="profile-summary-item">
                    <Mail size={17} />
                    <span>{user.email || "Email not available"}</span>
                  </div>

                  <div className="profile-summary-item">
                    <EducationIcon size={17} />
                    <span>
                      {formData.degree || "Degree not added"}
                    </span>
                  </div>

                  <div className="profile-summary-item">
                    <CalendarDays size={17} />
                    <span>
                      {formData.graduationYear ||
                        "Graduation year not added"}
                    </span>
                  </div>

                  <p className="profile-email-note">
                    Your email address is read-only on this page.
                  </p>
                </section>

                <section className="profile-card profile-details-card">
                  <div className="profile-section-heading">
                    <div>
                      <h2>Personal and academic details</h2>
                      <p>
                        {editing
                          ? "Update the fields below and save your changes."
                          : "Your current profile information."}
                      </p>
                    </div>

                    <UserRound size={21} />
                  </div>

                  <div className="profile-form-grid">
                    <div className="profile-field">
                      <label htmlFor="profile-name">Full name</label>
                      <input
                        id="profile-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        disabled={!editing || saving}
                        required
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-email">Email address</label>
                      <input
                        id="profile-email"
                        value={user.email || ""}
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-degree">Degree / course</label>
                      <input
                        id="profile-degree"
                        name="degree"
                        value={formData.degree}
                        onChange={handleChange}
                        placeholder="e.g. BSc Computer Science"
                        disabled={!editing || saving}
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-year">Graduation year</label>
                      <input
                        id="profile-year"
                        name="graduationYear"
                        type="number"
                        min="2000"
                        max="2100"
                        value={formData.graduationYear}
                        onChange={handleChange}
                        placeholder="e.g. 2027"
                        disabled={!editing || saving}
                      />
                    </div>

                    <div className="profile-field">
                      <label htmlFor="profile-cgpa">CGPA (out of 10)</label>
                      <input
                        id="profile-cgpa"
                        name="cgpa"
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={formData.cgpa}
                        onChange={handleChange}
                        placeholder="e.g. 8.5"
                        disabled={!editing || saving}
                      />
                    </div>

                    <div className="profile-field profile-field-full">
                      <label htmlFor="profile-skills">Skills</label>
                      <textarea
                        id="profile-skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="Python, SQL, React, Node.js"
                        rows={3}
                        disabled={!editing || saving}
                      />
                      <span className="profile-field-hint">
                        Separate each skill with a comma.
                      </span>
                    </div>
                  </div>

                  {editing && (
                    <div className="profile-form-actions">
                      <button
                        type="button"
                        className="profile-secondary-button"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X size={17} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="profile-primary-button"
                        disabled={saving}
                      >
                        {saving ? (
                          <LoaderCircle
                            size={17}
                            className="auth-spinner"
                          />
                        ) : (
                          <Save size={17} />
                        )}
                        {saving ? "Saving..." : "Save changes"}
                      </button>
                    </div>
                  )}
                </section>

                <section className="profile-card profile-skills-card">
                  <div className="profile-section-heading">
                    <div>
                      <h2>Skills overview</h2>
                      <p>Skills listed on your student profile.</p>
                    </div>

                    <Code2 size={21} />
                  </div>

                  <div className="profile-skill-list">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <span
                          className="profile-skill-tag"
                          key={`${skill}-${index}`}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="profile-no-skills">
                        No skills added yet. Edit your profile to add
                        your skills.
                      </p>
                    )}
                  </div>

                  <div className="profile-tip">
                    <Award size={19} />
                    <p>
                      Keep your skills accurate so placement officers
                      can better understand your profile.
                    </p>
                  </div>
                </section>
              </form>

              <section className="profile-card profile-resume-card">
                <div className="profile-section-heading">
                  <div>
                    <h2>Resume</h2>
                    <p>
                      Upload a PDF resume for your placement applications.
                    </p>
                  </div>

                  <FileText size={22} />
                </div>

                <div className="profile-resume-body">
                  <div className="profile-resume-current">
                    <div className="profile-resume-icon">
                      {user.resumeUrl ? (
                        <FileCheck2 size={25} />
                      ) : (
                        <FileText size={25} />
                      )}
                    </div>

                    <div className="profile-resume-info">
                      <strong>
                        {user.resumeUrl
                          ? "Resume uploaded"
                          : "No resume uploaded"}
                      </strong>

                      <span>
                        {user.resumeUrl
                          ? "Your resume is saved to your profile."
                          : "Choose a PDF file up to 5 MB."}
                      </span>
                    </div>

                    {user.resumeUrl && (
                      <button
                        type="button"
                        className="profile-secondary-button profile-resume-view"
                        onClick={handleViewResume}
                        disabled={viewingResume}
                      >
                        {viewingResume ? (
                          <LoaderCircle
                            size={16}
                            className="auth-spinner"
                          />
                        ) : (
                          <ExternalLink size={16} />
                        )}

                        {viewingResume ? "Opening..." : "View resume"}
                      </button>
                    )}
                  </div>

                  <form
                    className="profile-resume-upload"
                    onSubmit={handleResumeUpload}
                  >
                    <label htmlFor="profile-resume-file">
                      Choose resume (PDF)
                    </label>

                    <input
                      id="profile-resume-file"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleResumeSelection}
                      disabled={uploading}
                    />

                    <span className="profile-field-hint">
                      PDF format only. Maximum file size: 5 MB.
                    </span>

                    {selectedResume && (
                      <div className="profile-selected-file">
                        <FileCheck2 size={18} />
                        <span>{selectedResume.name}</span>

                        <button
                          type="button"
                          className="profile-remove-file"
                          aria-label="Remove selected resume"
                          onClick={() => {
                            setSelectedResume(null);

                            const input = document.getElementById(
                              "profile-resume-file"
                            );

                            if (input) input.value = "";
                          }}
                          disabled={uploading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="profile-primary-button"
                      disabled={!selectedResume || uploading}
                    >
                      {uploading ? (
                        <LoaderCircle
                          size={17}
                          className="auth-spinner"
                        />
                      ) : (
                        <Upload size={17} />
                      )}

                      {uploading
                        ? "Uploading..."
                        : user.resumeUrl
                          ? "Replace resume"
                          : "Upload resume"}
                    </button>
                  </form>
                </div>
              </section>
            </>
          ) : (
            <div className="profile-card profile-load-error">
              <h2>Profile unavailable</h2>
              <p>We couldn't find your profile information.</p>

              <button
                type="button"
                className="profile-primary-button"
                onClick={() => navigate("/student/dashboard")}
              >
                Return to dashboard
              </button>
            </div>
          )}

          <footer className="dashboard-footer">
            <span>© 2026 CampusHire</span>
            <span>
              Your next opportunity starts with your profile.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Profile;
