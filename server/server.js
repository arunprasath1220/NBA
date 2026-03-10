const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./auth/authRoutes");
const instituteRoutes = require("./institute/instituteRoutes");
const alliedCourseRoutes = require("./alliedCourse/alliedCourseRoutes");
const facultyRoutes = require("./faculty/facultyRoutes");
const criteria1 = require("./criteria1/criteria1Routes")

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // Vite dev server
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/allied-course", alliedCourseRoutes);
app.use("/api/faculty", facultyRoutes);


//criterias
app.use("/api/criteria1", criteria1);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
