const express = require("express");
const router = express.Router();
const { addIntake, getIntake, updateIntake, deleteIntake } = require("./intakeController");
const { authenticateToken, authorizeRoles } = require("../auth/authController");

// POST /api/intake - save intake details (admin only)
router.post("/", authenticateToken, authorizeRoles("admin"), addIntake);

// GET /api/intake?program_id=...&academic_year=... - read intake details
router.get("/", authenticateToken, authorizeRoles("admin", "user"), getIntake);

// PUT /api/intake/:id - update intake details (admin only)
router.put("/:id", authenticateToken, authorizeRoles("admin"), updateIntake);
// DELETE /api/intake/:id - delete intake details (admin only)
router.delete("/:id", authenticateToken, authorizeRoles("admin"), deleteIntake);


module.exports = router;
