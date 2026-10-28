
const express = require("express");
const mongoose = require("mongoose");

const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");
const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");
const officerMiddleware = require("../middleware/officerMiddleware");

const router = express.Router();

// POST: Student applies to an opportunity
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can apply for opportunities.",
      });
    }

    const {
      opportunityId,
      coverLetter = "",
      resumeUrl = "",
    } = req.body;

    if (!opportunityId || !mongoose.isValidObjectId(opportunityId)) {
      return res.status(400).json({
        success: false,
        message: "A valid opportunityId is required.",
      });
    }

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity || opportunity.status !== "Open") {
      return res.status(404).json({
        success: false,
        message: "Opportunity not found or applications are closed.",
      });
    }

    if (
      opportunity.applicationDeadline &&
      new Date(opportunity.applicationDeadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "The application deadline has passed.",
      });
    }

    const student = await User.findById(req.user.userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    // Check CGPA eligibility
    if (
      student.cgpa == null ||
      student.cgpa < opportunity.minCGPA
    ) {
      return res.status(400).json({
        success: false,
        message: `Minimum CGPA required: ${opportunity.minCGPA}.`,
      });
    }

    // Check degree eligibility
    if (
      opportunity.eligibleDegrees.length > 0 &&
      !opportunity.eligibleDegrees.some(
        (degree) =>
          degree.toLowerCase() ===
          (student.degree || "").trim().toLowerCase()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Your degree does not meet the eligibility criteria.",
      });
    }

    // Check graduation year eligibility
    if (
      opportunity.graduationYears.length > 0 &&
      !opportunity.graduationYears.includes(student.graduationYear)
    ) {
      return res.status(400).json({
        success: false,
        message: "Your graduation year is not eligible.",
      });
    }

    // Prevent duplicate applications
    const existingApplication = await Application.findOne({
      student: student._id,
      opportunity: opportunity._id,
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity.",
      });
    }

    const application = await Application.create({
      student: student._id,
      opportunity: opportunity._id,
      coverLetter,
      resumeUrl: resumeUrl || student.resumeUrl || "",
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied to this opportunity.",
      });
    }

    console.error("Application submission error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to submit application.",
    });
  }
});

// GET: Student views their own applications
router.get("/my", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "This endpoint is for students only.",
      });
    }

    const applications = await Application.find({
      student: req.user.userId,
    })
      .populate("opportunity")
      .sort({ appliedAt: -1 });

    return res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Fetch student applications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your applications.",
    });
  }
});

// GET: Any officer can view applicants for any opportunity
router.get(
  "/opportunity/:opportunityId",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      const { opportunityId } = req.params;

      if (!mongoose.isValidObjectId(opportunityId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity ID.",
        });
      }

      const opportunity = await Opportunity.findById(opportunityId);

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found.",
        });
      }

      const applications = await Application.find({
        opportunity: opportunityId,
      })
        .populate(
          "student",
          "name email degree graduationYear cgpa skills resumeUrl"
        )
        .sort({ appliedAt: -1 });

      return res.json({
        success: true,
        count: applications.length,
        applications,
      });
    } catch (error) {
      console.error("Fetch applicants error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch applicants.",
      });
    }
  }
);

// PATCH: Only the opportunity creator can update applicant status
router.patch(
  "/:id/status",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID.",
        });
      }

      const allowedStatuses = [
        "Pending",
        "Shortlisted",
        "Rejected",
        "Selected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status.",
        });
      }

      const application = await Application.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      const opportunity = await Opportunity.findOne({
        _id: application.opportunity,
        createdBy: req.user.userId,
      });

      if (!opportunity) {
        return res.status(403).json({
          success: false,
          message:
            "Only the opportunity creator can manage application status.",
        });
      }

      application.status = status;
      await application.save();

      return res.json({
        success: true,
        message: "Application status updated successfully.",
        application,
      });
    } catch (error) {
      console.error("Update application status error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update application status.",
      });
    }
  }
);

module.exports = router;
