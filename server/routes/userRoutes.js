
const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET logged-in student's profile
router.get("/profile", authMiddleware, async (req, res) => {
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
    console.error("Fetch profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
});

// UPDATE logged-in student's profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { degree, graduationYear, cgpa, skills, resumeUrl } = req.body;

    // Only update fields supplied by the client.
    const updates = {};

    if (degree !== undefined) updates.degree = degree;
    if (graduationYear !== undefined) {
      updates.graduationYear =
        graduationYear === "" ? undefined : graduationYear;
    }
    if (cgpa !== undefined) updates.cgpa = cgpa;
    if (skills !== undefined) updates.skills = skills;
    if (resumeUrl !== undefined) updates.resumeUrl = resumeUrl;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

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
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
    });
  }
});

module.exports = router;
