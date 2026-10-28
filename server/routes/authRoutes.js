
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const crypto = require("crypto");
const { Resend } = require("resend");

const router = express.Router();

// POST /api/v1/auth/register
console.log(
  "Officer invitation code configured:",
  Boolean(process.env.OFFICER_INVITATION_CODE)
);

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      invitationCode,
      degree,
      graduationYear,
      cgpa,
      skills,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (name.trim().length < 2 || name.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 100 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    if (!["student", "officer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be student or officer",
      });
    }

    // Officer registration requires an invitation code.
    if (role === "officer") {
      const expectedCode = process.env.OFFICER_INVITATION_CODE;

      if (!expectedCode) {
        return res.status(503).json({
          success: false,
          message: "Officer registration is not configured",
        });
      }

      if (
        typeof invitationCode !== "string" ||
        invitationCode.trim() !== expectedCode.trim()
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid officer invitation code",
        });
      }
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userData = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
    };

    if (role === "student") {
      Object.assign(userData, {
        degree,
        graduationYear,
        cgpa,
        skills,
      });
    }

    const user = await User.create(userData);

    return res.status(201).json({
      success: true,
      message: `${
        role === "officer" ? "Placement officer" : "Student"
      } account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to register user",
    });
  }
});

// POST /api/v1/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in",
    });
  }
});

/* POST /api/v1/auth/forgot-password */
router.post("/forgot-password", async (req, res) => {
  let user;

  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    const genericMessage =
      "If an account exists with that email, a password reset link will be sent.";

    if (!email) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    user = await User.findOne({ email }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    // Do not reveal whether an account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    if (!process.env.RESEND_API_KEY || !process.env.FRONTEND_URL) {
      throw new Error("Password reset email configuration is missing");
    }

    // Generate a random token; store only its SHA-256 hash.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const resetUrl =
      `${process.env.FRONTEND_URL.replace(/\/$/, "")}` +
      `/reset-password?token=${resetToken}`;

    const { error } = await resend.emails.send({
      from: "CampusHire <onboarding@resend.dev>",
      to: [user.email],
      subject: "Reset your CampusHire password",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>Password reset</h2>
          <p>We received a request to reset your CampusHire password.</p>
          <p>
            <a href="${resetUrl}"
               style="background:#2563eb;color:white;padding:12px 18px;
                      text-decoration:none;border-radius:6px;display:inline-block">
              Reset password
            </a>
          </p>
          <p>This link expires in 15 minutes and can only be used once.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      throw new Error("Unable to send password reset email");
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    // Invalidate the token if the email could not be sent.
    if (user) {
      try {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
      } catch (cleanupError) {
        console.error("Reset-token cleanup failed");
      }
    }

    console.error("Forgot-password request failed");
    return res.status(500).json({
      success: false,
      message: "Unable to process the request right now. Please try again later.",
    });
  }
});

/* POST /api/v1/auth/reset-password */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid reset token and password of at least 8 characters are required.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This reset link is invalid or has expired. Request a new one.",
      });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset failed");
    return res.status(500).json({
      success: false,
      message: "Unable to reset your password right now. Please try again.",
    });
  }
});


// GET /api/v1/auth/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
});

// PUT /api/v1/auth/me
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can update this profile",
      });
    }

    const {
      name,
      degree,
      graduationYear,
      cgpa,
      skills,
      resumeUrl,
    } = req.body || {};

    if (
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 100 characters",
      });
    }

    if (degree !== undefined && typeof degree !== "string") {
      return res.status(400).json({
        success: false,
        message: "Degree must be text",
      });
    }

    let parsedYear = user.graduationYear;

    if (graduationYear !== undefined) {
      if (graduationYear === "" || graduationYear === null) {
        parsedYear = undefined;
      } else {
        parsedYear = Number(graduationYear);

        if (
          !Number.isInteger(parsedYear) ||
          parsedYear < 2000 ||
          parsedYear > 2100
        ) {
          return res.status(400).json({
            success: false,
            message: "Enter a valid graduation year",
          });
        }
      }
    }

    let parsedCgpa = user.cgpa;

    if (cgpa !== undefined) {
      if (cgpa === "" || cgpa === null) {
        parsedCgpa = undefined;
      } else {
        parsedCgpa = Number(cgpa);

        if (
          !Number.isFinite(parsedCgpa) ||
          parsedCgpa < 0 ||
          parsedCgpa > 10
        ) {
          return res.status(400).json({
            success: false,
            message: "CGPA must be between 0 and 10",
          });
        }
      }
    }

    let parsedSkills = user.skills;

    if (skills !== undefined) {
      if (
        !Array.isArray(skills) ||
        !skills.every((skill) => typeof skill === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Skills must be a list of text values",
        });
      }

      parsedSkills = [
        ...new Set(
          skills.map((skill) => skill.trim()).filter(Boolean)
        ),
      ];
    }

    if (
      resumeUrl !== undefined &&
      typeof resumeUrl !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume URL must be text",
      });
    }

    user.name = name.trim();

    if (degree !== undefined) {
      user.degree = degree.trim();
    }

    user.graduationYear = parsedYear;
    user.cgpa = parsedCgpa;
    user.skills = parsedSkills;

    if (resumeUrl !== undefined) {
      user.resumeUrl = resumeUrl.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        degree: user.degree,
        graduationYear: user.graduationYear,
        cgpa: user.cgpa,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
});

module.exports = router;
