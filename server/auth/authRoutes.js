const express = require("express");
const router = express.Router();
const {
  googleLogin,
  getCurrentUser,
  logout,
  authenticateToken,
  authorizeRoles,
} = require("./authController");

// Google OAuth login
router.post("/google", googleLogin);

// Get current user (requires authentication)
router.get("/me", getCurrentUser);

// Logout
router.post("/logout", logout);

// Protected route - requires authentication only
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Admin only route - requires admin role
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin!", user: req.user });
});

// User route - requires user or admin role
router.get(
  "/user",
  authenticateToken,
  authorizeRoles("user", "admin"),
  (req, res) => {
    res.json({ message: "Welcome User!", user: req.user });
  },
);

module.exports = router;
