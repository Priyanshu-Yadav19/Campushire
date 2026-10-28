
const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Opportunity title is required"],
      trim: true,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    type: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time"],
      required: [true, "Opportunity type is required"],
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    salary: {
      type: String,
      default: "Not specified",
    },

    minCGPA: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    eligibleDegrees: {
      type: [String],
      default: [],
    },

    graduationYears: {
      type: [Number],
      default: [],
    },

    requiredSkills: {
      type: [String],
      default: [],
    },

    applicationDeadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creating officer is required"],
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);
