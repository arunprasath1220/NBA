const express = require("express");
const router = express.Router();
const {
  getProgramNames,
  getProgramDetails,
  getInstituteProfile,
  saveInstituteProfile,
  getDisciplines,
  getProgramLevels,
  addProgramName,
  addCourse,
  getAllCourses,
  updateCourse,
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

// Get all disciplines - accessible by authenticated users
router.get(
  "/disciplines",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getDisciplines
);

// Get all program levels - accessible by authenticated users
router.get(
  "/program-levels",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramLevels
);

// Add a new program name - only accessible by admin
router.post(
  "/program-name",
  authenticateToken,
  authorizeRoles("admin"),
  addProgramName
);

// Add a new course to all_program table - only accessible by admin
router.post(
  "/course",
  authenticateToken,
  authorizeRoles("admin"),
  addCourse
);

// Get all courses from all_program table - accessible by authenticated users
router.get(
  "/courses",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getAllCourses
);

// Update a course in all_program table - only accessible by admin
router.put(
  "/course/:id",
  authenticateToken,
  authorizeRoles("admin"),
  updateCourse
);

module.exports = router;
