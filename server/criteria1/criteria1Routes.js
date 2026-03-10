const express = require("express");
const router = express.Router();
const { visionMissionHandler } = require("./Mission&Vission");

// GET /api/vision-mission
router.get("/visions-missions", visionMissionHandler);

module.exports = router;