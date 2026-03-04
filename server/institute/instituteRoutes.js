const express = require("express");
const router = express.Router();
const {
  getProgramNames,
  getProgramDetails,
  getInstituteProfile,
  saveInstituteProfile,
} = require("./instituteController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../auth/authController");

/**
 * Institute Profile Routes
 * 
 * GET  /api/institute/programs - Get all program names (authenticated users)
 * GET  /api/institute/profile - Get institute profile (authenticated users)
 * POST /api/institute/profile - Create/Update institute profile (admin only)
 */

// Get program names - accessible by authenticated users
router.get(
  "/programs",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramNames
);

// Get program details (level, discipline) - accessible by authenticated users
router.get(
  "/programs/:programId/details",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramDetails
);

// Get institute profile - accessible by authenticated users (admin and user)
router.get(
  "/profile",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getInstituteProfile
);

// Save institute profile - only accessible by admin
router.post(
  "/profile",
  authenticateToken,
  authorizeRoles("admin"),
  saveInstituteProfile
);

module.exports = router;
