
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const User = require("../models/User");
const Resume = require("../models/Resume");
const Application = require("../models/Application");
const Opportunity = require("../models/Opportunity");

const authMiddleware = require("../middleware/authMiddleware");
const officerMiddleware = require("../middleware/officerMiddleware");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfExtension =
      file.originalname.toLowerCase().endsWith(".pdf");

    if (isPdfMime && isPdfExtension) {
      return cb(null, true);
    }

    cb(new Error("Only PDF resume files are allowed"));
  },
});

// Handle upload errors without crashing the server.
function handleUpload(req, res, next) {
  upload.single("resume")(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      return res
        .status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400)
        .json({
          success: false,
          message:
            err.code === "LIMIT_FILE_SIZE"
              ? "Resume must be 5 MB or smaller"
              : "Unable to upload resume",
        });
    }

    return res.status(400).json({
      success: false,
      message: err.message || "Unable to upload resume",
    });
  });
}

// POST /api/v1/resumes/upload
router.post(
  "/upload",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can upload resumes",
      });
    }
    next();
  },
  handleUpload,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select a PDF resume",
        });
      }

      if (
        req.file.buffer.length < 5 ||
        req.file.buffer.subarray(0, 5).toString("ascii") !== "%PDF-"
      ) {
        return res.status(400).json({
          success: false,
          message: "The selected file is not a valid PDF",
        });
      }

      const user = await User.findById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const safeFilename = req.file.originalname.replace(
        /[\\/\r\n\0]/g,
        "_"
      );

      await Resume.findOneAndUpdate(
        { student: user._id },
        {
          $set: {
            filename: safeFilename,
            contentType: "application/pdf",
            data: req.file.buffer,
            size: req.file.size,
          },
        },
        {
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      user.resumeUrl = "mongodb";
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Resume uploaded successfully",
        filename: safeFilename,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Resume upload error:", error.message);

      return res.status(500).json({
        success: false,
        message: "Unable to upload resume",
      });
    }
  }
);

// Shared secure resume response.
async function sendResume(req, res, next) {
  try {
    const { studentId } = req.params;

    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const isStudent = req.user.role === "student";
    const isOfficer = req.user.role === "officer";

    if (!isStudent && !isOfficer) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Students can access only their own resume.
    if (isStudent && req.user.userId !== studentId) {
      return res.status(403).json({
        success: false,
        message: "You can access only your own resume",
      });
    }

    if (isOfficer) {
      // Officers can access resumes only for applicants
      // to opportunities that they created.
      const applications = await Application.find({
        student: studentId,
      }).select("opportunity");

      const opportunityIds = applications.map(
        (application) => application.opportunity
      );

      const authorizedOpportunity = await Opportunity.exists({
        _id: { $in: opportunityIds },
        createdBy: req.user.userId,
      });

      if (!authorizedOpportunity) {
        return res.status(403).json({
          success: false,
          message:
            "You can access resumes only for applicants to your opportunities",
        });
      }
    }

    const resume = await Resume.findOne({
      student: studentId,
    }).select("+data");

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const shouldDownload = req.path.endsWith("/download");

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(resume.size),
      "Content-Disposition": `${shouldDownload ? "attachment" : "inline"}; filename="resume.pdf"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });

    return res.send(resume.data);
  } catch (error) {
    console.error("Resume access error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to access resume",
    });
  }
}

// GET /api/v1/resumes/:studentId/view
router.get(
  "/:studentId/view",
  authMiddleware,
  sendResume
);

// GET /api/v1/resumes/:studentId/download
router.get(
  "/:studentId/download",
  authMiddleware,
  sendResume
);

module.exports = router;
