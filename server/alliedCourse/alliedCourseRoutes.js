const express = require("express");
const router = express.Router();
const {
  getProgramLevels,
  getProgramsByLevel,
  getProgramDepartment,
  getAllDepartments,
  getDepartmentsByLevel,
  getProgramsByLevelAndDepartment,
  getAllAlliedMappings,
  addAlliedMapping,
  updateAlliedMapping,
  deleteAlliedMapping,
  importAlliedMappingsByYear,
} = require("./alliedCourseController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../auth/authController");

/**
 * Allied Course Mapping Routes
 * 
 * GET  /api/allied-course/program-levels - Get all program levels
 * GET  /api/allied-course/programs/:levelId?academicYear=YYYY-YY - Get programs filtered by level and optional year
 * GET  /api/allied-course/program/:programId/department - Get department for a program
 * GET  /api/allied-course/departments?academicYear=YYYY-YY - Get all unique departments
 * GET  /api/allied-course/departments/:levelId?academicYear=YYYY-YY - Get departments filtered by level and optional year
 * GET  /api/allied-course/programs/:levelId/:departmentName?academicYear=YYYY-YY - Get programs filtered by level, department and optional year
 * GET  /api/allied-course/mappings?academicYear=YYYY-YY - Get allied mappings for a year snapshot (or all if omitted)
 * POST /api/allied-course/mappings/import-year - Import mapping snapshot from one year to another (admin only)
 * POST /api/allied-course/mapping - Add a new allied course mapping (admin only, requires academicYear in body)
 * PUT  /api/allied-course/mapping/:id - Update an allied course mapping (admin only, requires academicYear in body)
 * DELETE /api/allied-course/mapping/:id - Delete an allied course mapping (admin only)
 */

// Get all program levels - accessible by authenticated users
router.get(
  "/program-levels",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramLevels
);

// Get programs by level - accessible by authenticated users
router.get(
  "/programs/:levelId",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramsByLevel
);

// Get department for a specific program - accessible by authenticated users
router.get(
  "/program/:programId/department",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramDepartment
);

// Get all unique departments - accessible by authenticated users
router.get(
  "/departments",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getAllDepartments
);

// Get departments by level - accessible by authenticated users
router.get(
  "/departments/:levelId",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getDepartmentsByLevel
);

// Get programs by level and department - accessible by authenticated users
router.get(
  "/programs/:levelId/:departmentName",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getProgramsByLevelAndDepartment
);

// Get all allied course mappings - accessible by authenticated users
router.get(
  "/mappings",
  authenticateToken,
  authorizeRoles("admin", "user"),
  getAllAlliedMappings
);

// Import mappings from source year to target year - only accessible by admin
router.post(
  "/mappings/import-year",
  authenticateToken,
  authorizeRoles("admin"),
  importAlliedMappingsByYear
);

// Add a new allied course mapping - only accessible by admin
router.post(
  "/mapping",
  authenticateToken,
  authorizeRoles("admin"),
  addAlliedMapping
);

// Update an allied course mapping - only accessible by admin
router.put(
  "/mapping/:groupId",
  authenticateToken,
  authorizeRoles("admin"),
  updateAlliedMapping
);

// Delete an allied course group - only accessible by admin
router.delete(
  "/mapping/:groupId",
  authenticateToken,
  authorizeRoles("admin"),
  deleteAlliedMapping
);

module.exports = router;
