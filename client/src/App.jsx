
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  Search,
  ShieldCheck,
  Users,
  Building2,
  CheckCircle2,
  MapPin,
  CalendarDays,
  Menu,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/dashboard";
import Opportunities from "./pages/opportunites";
import OfficerDashboard from "./pages/OfficerDashboard";
import CreateOpportunity from "./pages/CreateOpportunity";
import Applications from "./pages/Applications";
import StudentApplications from "./pages/StudentApplications";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";



// Sample opportunities for the homepage
const opportunities = [
  {
    type: "Internship",
    title: "Python Developer Intern",
    company: "Technology & Software",
    location: "Ahmedabad, Gujarat",
    stipend: "₹15,000 / month",
    skills: ["Python", "SQL"],
  },
  {
    type: "Full-time",
    title: "Junior Software Developer",
    company: "Software & IT",
    location: "Surat, Gujarat",
    stipend: "Package varies",
    skills: ["JavaScript", "React"],
  },
  {
    type: "Internship",
    title: "Data Analyst Intern",
    company: "Analytics & Data",
    location: "Vadodara, Gujarat",
    stipend: "Package varies",
    skills: ["Python", "Excel"],
  },
];

// Homepage
function Home() {
  return (
    <div className="app">
      <header className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">
            <GraduationCap size={25} />
          </span>
          <span>
            Campus<span className="brand-accent">Hire</span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#opportunities">Opportunities</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="nav-actions">
          <Link className="login-link" to="/login">
            Log in
          </Link>

          <Link className="button button-primary nav-button" to="/register">
            Get started <ArrowRight size={16} />
          </Link>
        </div>

        <a
          className="mobile-menu"
          href="#opportunities"
          aria-label="View opportunities"
        >
          <Menu size={24} />
        </a>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR CAREER STARTS HERE
            </div>

            <h1>
              Your next opportunity.
              <br />
              <span>Your future,</span> within reach.
            </h1>

            <p className="hero-description">
              Discover internships and jobs, connect with opportunities,
              and take the next step in your career — all in one place.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#opportunities">
                Explore opportunities <ArrowRight size={18} />
              </a>

              <a className="button button-outline" href="#how-it-works">
                How it works
              </a>
            </div>

            <div className="hero-trust">
              <div className="trust-icon">
                <ShieldCheck size={19} />
              </div>
              <span>
                One platform for students and placement officers
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-orbit orbit-one" />
            <div className="visual-orbit orbit-two" />

            <div className="visual-card visual-main">
              <div className="visual-card-top">
                <span className="mini-label">CAREER OPPORTUNITY</span>
                <span className="open-pill">Open</span>
              </div>

              <div className="visual-company-icon">
                <Building2 size={27} />
              </div>

              <h3>Build your future</h3>
              <p>Find the role that matches your skills and ambitions.</p>

              <div className="visual-divider" />

              <div className="visual-detail">
                <MapPin size={16} />
                Gujarat, India
              </div>

              <div className="visual-detail">
                <BriefcaseBusiness size={16} />
                Internships & full-time jobs
              </div>

              <div className="visual-skills">
                <span>Skills</span>
                <div>
                  <span>Technology</span>
                  <span>Growth</span>
                </div>
              </div>
            </div>

            <div className="floating-card floating-top">
              <span className="floating-icon">
                <CheckCircle2 size={21} />
              </span>
              <div>
                <strong>Application tracked</strong>
                <p>Stay updated at every step</p>
              </div>
            </div>

            <div className="floating-card floating-bottom">
              <span className="floating-icon purple">
                <Users size={21} />
              </span>
              <div>
                <strong>Made for students</strong>
                <p>Your journey, organized</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits section */}
        <section className="benefits">
          <div className="benefit-item">
            <div className="benefit-icon">
              <Search size={22} />
            </div>
            <div>
              <h3>Find opportunities</h3>
              <p>Explore jobs and internships in one place.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <GraduationCap size={22} />
            </div>
            <div>
              <h3>Student-first experience</h3>
              <p>Keep your profile and applications organized.</p>
            </div>
          </div>

          <div className="benefit-item">
            <div className="benefit-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3>Clear application status</h3>
              <p>Track progress from pending to final decision.</p>
            </div>
          </div>
        </section>

        {/* Opportunities section */}
        <section className="opportunities-section" id="opportunities">
          <div className="section-heading">
            <div>
              <span className="section-kicker">TAKE YOUR NEXT STEP</span>
              <h2>Explore opportunities</h2>
              <p>
                Discover the kinds of roles you can find on CampusHire.
              </p>
            </div>

            <Link to="/register" className="text-link">
              Get started <ArrowRight size={17} />
            </Link>
          </div>

          <div className="opportunity-grid">
            {opportunities.map((job) => (
              <article className="opportunity-card" key={job.title}>
                <div className="job-card-top">
                  <span className="job-icon">
                    <BriefcaseBusiness size={22} />
                  </span>
                  <span className="job-type">{job.type}</span>
                </div>

                <h3>{job.title}</h3>
                <p className="job-company">{job.company}</p>

                <div className="job-location">
                  <MapPin size={16} />
                  {job.location}
                </div>

                <div className="job-skills">
                  {job.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>

                <div className="job-card-footer">
                  <span>{job.stipend}</span>
                  <Link
                    to="/register"
                    aria-label={`Register for ${job.title}`}
                  >
                    <ArrowRight size={19} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <p className="demo-note">
            These are preview cards for the design. Live opportunities will
            load from the CampusHire backend in a later step.
          </p>
        </section>

        {/* How it works section */}
        <section className="how-section" id="how-it-works">
          <div className="how-heading">
            <span className="section-kicker">SIMPLE BY DESIGN</span>
            <h2>From profile to opportunity</h2>
            <p>Everything you need to manage your placement journey.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <GraduationCap size={27} />
              <h3>Create your profile</h3>
              <p>Add your education, CGPA, skills and resume link.</p>
            </article>

            <article className="step-card">
              <span className="step-number">02</span>
              <Search size={27} />
              <h3>Find your opportunity</h3>
              <p>Browse available roles and check the eligibility criteria.</p>
            </article>

            <article className="step-card">
              <span className="step-number">03</span>
              <CalendarDays size={27} />
              <h3>Apply and track</h3>
              <p>Submit applications and follow your status updates.</p>
            </article>
          </div>
        </section>

        {/* Call to action */}
        <section className="cta-section" id="register">
          <div>
            <span className="section-kicker">YOUR NEXT CHAPTER</span>
            <h2>Ready to take the next step?</h2>
            <p>
              Start organizing your career opportunities with CampusHire.
            </p>
          </div>

          <Link to="/register" className="button button-light">
            Join CampusHire <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      <footer className="footer">
        <a href="#home" className="brand footer-brand">
          <span className="brand-icon">
            <GraduationCap size={23} />
          </span>
          <span>
            Campus<span className="brand-accent">Hire</span>
          </span>
        </a>

        <p>Connecting students with their next opportunity.</p>
        <span>© 2026 CampusHire</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/student/dashboard"
          element={<Dashboard />}
        />
        <Route
  path="/applications"
  element={<StudentApplications />}
/>
<Route path="/profile" element={<Profile />} />


  <Route
  path="/officer/dashboard"
  element={<OfficerDashboard />}
  />

        <Route
          path="/opportunities"
          element={<Opportunities />}
        />
        <Route
  path="/officer/opportunities/new"
  element={<CreateOpportunity />}
/>
<Route
  path="/officer/applications"
  element={<Applications />}
/>
        <Route
          path="*"
          element={
            <main style={{ padding: "60px 24px", textAlign: "center" }}>
              <h1>404 - Page not found</h1>
              <p style={{ margin: "16px 0" }}>
                The page you are looking for does not exist.
              </p>
              <Link to="/" className="button button-primary">
                Back to home
              </Link>
            </main>
          }
        />
      </Routes>
      
    </BrowserRouter>
  );
}

export default App;
