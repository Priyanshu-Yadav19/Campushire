
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const opportunityRoutes = require("./routes/opportunityRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const resumeRoutes = require("./routes/resumeRoutes");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// Serve uploaded resumes
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusHire backend is running",
  });
});

// Authentication routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/opportunities", opportunityRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/resumes", resumeRoutes);


// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
