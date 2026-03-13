const express = require("express");
const router = express.Router();
const {
  getStudentByDepartment,
  upsertStudentByDepartment,
} = require("./studentByDepartmentController");
const { authenticateToken, authorizeRoles } = require("../auth/authController");

router.get("/", authenticateToken, authorizeRoles("admin", "user"), getStudentByDepartment);
router.post("/", authenticateToken, authorizeRoles("admin"), upsertStudentByDepartment);

module.exports = router;
