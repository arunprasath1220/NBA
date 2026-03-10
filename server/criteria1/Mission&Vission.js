const axios = require("axios");
const cheerio = require("cheerio");

const TARGET_URL = "https://www.bitsathy.ac.in/vision-mission/";

async function visionMissionHandler(req, res) {
  try {
    const { data: html } = await axios.get(TARGET_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    // ── Vision ───────────────────────────────────────────────────────────────
    const vision = $(".VM-content-vision .Vision-right p").first().text().trim().replace(/\s+/g, " ") || null;

    // ── Mission ───────────────────────────────────────────────────────────────
    const mission = [];
    $(".VM-content-mission .mission-right .mission-list li").each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (text) mission.push(text);
    });

    if (!vision && mission.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Vision/Mission content not found. Page structure may have changed.",
        source: TARGET_URL,
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vision,
        mission: mission.length ? mission : null,
      },
      source: TARGET_URL,
      scrapedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error("[visionMissionHandler] Error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to scrape the page.",
      details: err.message,
    });
  }
}

module.exports = {visionMissionHandler};