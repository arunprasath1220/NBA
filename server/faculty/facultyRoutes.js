const express = require("express");
const router = express.Router();
const { addFaculty, getFaculty } = require("./facultyController");

// POST /api/faculty/add
router.post("/add", addFaculty);

// GET /api/faculty?program_id=...
router.get("/", getFaculty);

module.exports = router;
