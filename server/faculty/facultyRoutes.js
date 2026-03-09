const express = require("express");
const router = express.Router();
const { addFaculty, bulkAddFaculty, getFaculty, updateFaculty } = require("./facultyController");
const { authenticateToken, authorizeRoles } = require("../auth/authController");

// POST /api/faculty/add
router.post("/add", authenticateToken, authorizeRoles("admin"), addFaculty);

// POST /api/faculty/bulk-add
router.post("/bulk-add", authenticateToken, authorizeRoles("admin"), bulkAddFaculty);

// GET /api/faculty?program_id=...
router.get("/", getFaculty);

// PUT /api/faculty/:id - update existing faculty
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateFaculty);

module.exports = router;
