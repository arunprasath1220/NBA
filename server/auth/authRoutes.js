const express = require("express");
const router = express.Router();
const {
  googleLogin,
  getCurrentUser,
  logout,
  authenticateToken,
} = require("./authController");

// Google OAuth login
router.post("/google", googleLogin);

// Get current user (requires authentication)
router.get("/me", getCurrentUser);

// Logout
router.post("/logout", logout);

// Protected route example
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
