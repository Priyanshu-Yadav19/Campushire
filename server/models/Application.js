
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: [true, "Opportunity is required"],
    },

    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected", "Selected"],
      default: "Pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    resumeUrl: {
      type: String,
      default: "",
      trim: true,
    },

    coverLetter: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same student from applying to the same opportunity twice.
applicationSchema.index(
  { student: 1, opportunity: 1 },
  { unique: true }
);

module.exports = mongoose.model("Application", applicationSchema);
