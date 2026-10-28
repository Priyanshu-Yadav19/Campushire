
const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    filename: {
      type: String,
      required: true,
      trim: true,
    },

    contentType: {
      type: String,
      default: "application/pdf",
      enum: ["application/pdf"],
    },

    data: {
      type: Buffer,
      required: true,
    },

    size: {
      type: Number,
      required: true,
      max: 5 * 1024 * 1024,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
