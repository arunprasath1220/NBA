const express = require("express");
const router = express.Router();
const { addFaculty, getFaculty, updateFaculty } = require("./facultyController");

// POST /api/faculty/add
router.post("/add", addFaculty);

// GET /api/faculty?program_id=...
router.get("/", getFaculty);

// PUT /api/faculty/:id - update existing faculty
router.put("/:id", updateFaculty);

module.exports = router;
