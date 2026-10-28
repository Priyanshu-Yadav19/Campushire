
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "officer"],
      default: "student",
      required: true,
    },

    degree: {
      type: String,
      trim: true,
      default: "",
    },

    graduationYear: {
      type: Number,
      min: 2000,
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
    },

    skills: {
      type: [String],
      default: [],
    },
     passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
