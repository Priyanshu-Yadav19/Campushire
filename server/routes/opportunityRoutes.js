
const express = require("express");
const mongoose = require("mongoose");

const Opportunity = require("../models/Opportunity");
const authMiddleware = require("../middleware/authMiddleware");
const officerMiddleware = require("../middleware/officerMiddleware");

const router = express.Router();

// GET: List open opportunities (public)

 // GET: List opportunities
// Officers see all opportunities; students/public see only open ones.
router.get("/", async (req, res) => {
  try {
    const { search, type, location } = req.query;

    // Determine whether this request is from an authenticated officer.
    let isOfficer = false;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        isOfficer = decoded.role === "officer";
      } catch {
        isOfficer = false;
      }
    }

    // Officers need open and closed opportunities for application review.
    const filter = isOfficer ? {} : { status: "Open" };

    if (type) {
      filter.type = type;
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { requiredSkills: { $regex: search, $options: "i" } },
      ];
    }

    const opportunities = await Opportunity.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name");

    return res.json({
      success: true,
      count: opportunities.length,
      opportunities,
    });
  } catch (error) {
    console.error("Fetch opportunities error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch opportunities",
    });
  }
});

// GET: List all opportunities created by the logged-in officer
// Must appear before GET /:id
router.get(
  "/my",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      const opportunities = await Opportunity.find({
        createdBy: req.user.userId,
      }).sort({ createdAt: -1 });

      res.json({
        success: true,
        count: opportunities.length,
        opportunities,
      });
    } catch (error) {
      console.error("Fetch officer opportunities error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to fetch your opportunities",
      });
    }
  }
);

// GET: Get one open opportunity by ID (public)
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid opportunity ID",
      });
    }

    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      status: "Open",
    }).populate("createdBy", "name");

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: "Open opportunity not found",
      });
    }

    res.json({
      success: true,
      opportunity,
    });
  } catch (error) {
    console.error("Fetch opportunity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch opportunity",
    });
  }
});

// POST: Create an opportunity (officers only)
router.post(
  "/",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        company,
        description,
        type,
        location,
        salary,
        minCGPA,
        eligibleDegrees,
        graduationYears,
        requiredSkills,
        applicationDeadline,
      } = req.body;

      const opportunity = await Opportunity.create({
        title,
        company,
        description,
        type,
        location,
        salary,
        minCGPA,
        eligibleDegrees,
        graduationYears,
        requiredSkills,
        applicationDeadline,
        createdBy: req.user.userId,
      });

      res.status(201).json({
        success: true,
        message: "Opportunity created successfully",
        opportunity,
      });
    } catch (error) {
      console.error("Create opportunity error:", error);

      res.status(400).json({
        success: false,
        message: "Failed to create opportunity. Check the supplied fields.",
      });
    }
  }
);

// PUT: Update opportunity details (creating officer only)
router.put(
  "/:id",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity ID",
        });
      }

      const allowedFields = [
        "title",
        "company",
        "description",
        "type",
        "location",
        "salary",
        "minCGPA",
        "eligibleDegrees",
        "graduationYears",
        "requiredSkills",
        "applicationDeadline",
        "status",
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      const opportunity = await Opportunity.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user.userId,
        },
        updates,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found or you are not its creator",
        });
      }

      res.json({
        success: true,
        message: "Opportunity updated successfully",
        opportunity,
      });
    } catch (error) {
      console.error("Update opportunity error:", error);

      res.status(400).json({
        success: false,
        message: "Failed to update opportunity",
      });
    }
  }
);

// PATCH: Update status between Open and Closed (creating officer only)
router.patch(
  "/:id/status",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity ID",
        });
      }

      const { status } = req.body;

      if (!["Open", "Closed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "Open" or "Closed"',
        });
      }

      const opportunity = await Opportunity.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user.userId,
        },
        { status },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found or you are not its creator",
        });
      }

      res.json({
        success: true,
        message: `Opportunity status changed to ${status}`,
        opportunity,
      });
    } catch (error) {
      console.error("Update opportunity status error:", error);

      res.status(400).json({
        success: false,
        message: "Failed to update opportunity status",
      });
    }
  }
);

// PATCH: Close an opportunity (backward compatibility)
router.patch(
  "/:id/close",
  authMiddleware,
  officerMiddleware,
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid opportunity ID",
        });
      }

      const opportunity = await Opportunity.findOneAndUpdate(
        {
          _id: req.params.id,
          createdBy: req.user.userId,
        },
        { status: "Closed" },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!opportunity) {
        return res.status(404).json({
          success: false,
          message: "Opportunity not found or you are not its creator",
        });
      }

      res.json({
        success: true,
        message: "Opportunity closed successfully",
        opportunity,
      });
    } catch (error) {
      console.error("Close opportunity error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to close opportunity",
      });
    }
  }
);

module.exports = router;
