const pool = require("../db");

/**
 * Add a faculty record to faculty_details
 */
const addFaculty = async (req, res) => {
  const {
    program_id,
    faculty_name,
    pan_no,
    apaar_faculty_id,
    highest_degree,
    university_name,
    area_of_specialization,
    date_of_joining,
    designation_at_joining,
    present_designation,
    date_designated_as_prof,
    date_of_receiving_highest_degree,
    nature_of_association = 'Regular',
    working_presently,
    date_of_leaving,
    experience_years,
    is_hod_principal,
  } = req.body;

  if (!program_id || !faculty_name) {
    return res.status(400).json({ success: false, error: "program_id and faculty_name are required" });
  }

  // Resolve program_id: frontend sends program_name.id (from program_name table)
  // but faculty_details.program_id has a FK to programname_level_discipline.id.
  // Try to resolve the provided value to a programname_level_discipline.id
  let resolvedProgramId = null;
  try {
    // First, check if the provided id directly matches programname_level_discipline.id
    const [direct] = await pool.execute(
      "SELECT id FROM programname_level_discipline WHERE id = ?",
      [program_id]
    );
    if (direct.length > 0) {
      resolvedProgramId = direct[0].id;
    } else {
      // Otherwise, treat the provided id as program_name.id and find the matching pld row
      const [byName] = await pool.execute(
        "SELECT id FROM programname_level_discipline WHERE name = ? LIMIT 1",
        [program_id]
      );
      if (byName.length > 0) {
        resolvedProgramId = byName[0].id;
      }
    }

    if (!resolvedProgramId) {
      return res.status(400).json({ success: false, error: "program_id does not correspond to a valid program offering (programname_level_discipline)" });
    }
  } catch (err) {
    console.error("Error resolving program_id:", err);
    return res.status(500).json({ success: false, error: "Failed to validate program_id" });
  }

  try {
    const sql = `INSERT INTO faculty_details (
      program_id, faculty_name, pan_no, apaar_faculty_id, highest_degree, university_name,
      area_of_specialization, date_of_joining, designation_at_joining, present_designation,
      date_designated_as_prof, date_of_receiving_highest_degree, nature_of_association,
      working_presently, date_of_leaving, experience_years, is_hod_principal, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

    const params = [
      resolvedProgramId,
      faculty_name,
      pan_no || null,
      apaar_faculty_id || null,
      highest_degree || null,
      university_name || null,
      area_of_specialization || null,
      date_of_joining || null,
      designation_at_joining || null,
      present_designation || null,
      date_designated_as_prof || null,
      date_of_receiving_highest_degree || null,
      nature_of_association || 'Regular',
      working_presently || null,
      date_of_leaving || null,
      experience_years || null,
      is_hod_principal || null,
    ];

    const [result] = await pool.query(sql, params);

    return res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error adding faculty:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

/**
 * Get faculty list by program_id (query param)
 */
const getFaculty = async (req, res) => {
  const { program_id } = req.query;

  try {
    // Join with programname_level_discipline and program_name so we can return
    // the program_name id (pld.name) together with the faculty record. This
    // lets the frontend map back to the program_name selection when editing.
    let sql = `SELECT f.*, pld.name AS program_name_id, pn.coursename AS program_coursename
               FROM faculty_details f
               LEFT JOIN programname_level_discipline pld ON f.program_id = pld.id
               LEFT JOIN program_name pn ON pld.name = pn.id`;
    const params = [];

    if (program_id) {
      // Resolve provided program_id (could be pld.id or program_name.id)
      let resolvedProgramId = null;
      // Check direct match to pld.id
      const [direct] = await pool.execute(
        "SELECT id FROM programname_level_discipline WHERE id = ?",
        [program_id]
      );
      if (direct.length > 0) {
        resolvedProgramId = direct[0].id;
      } else {
        const [byName] = await pool.execute(
          "SELECT id FROM programname_level_discipline WHERE name = ? LIMIT 1",
          [program_id]
        );
        if (byName.length > 0) resolvedProgramId = byName[0].id;
      }

      if (!resolvedProgramId) {
        return res.status(400).json({ success: false, error: "program_id does not correspond to any program offering" });
      }

      // Filter by the resolved pld.id
      sql += " WHERE f.program_id = ?";
      params.push(resolvedProgramId);
    }

    sql += " ORDER BY id DESC";

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

module.exports = {
  addFaculty,
  getFaculty,
};

/**
 * Update an existing faculty record by id
 */
const updateFaculty = async (req, res) => {
  const { id } = req.params;
  const {
    program_id,
    faculty_name,
    pan_no,
    apaar_faculty_id,
    highest_degree,
    university_name,
    area_of_specialization,
    date_of_joining,
    designation_at_joining,
    present_designation,
    date_designated_as_prof,
    date_of_receiving_highest_degree,
    nature_of_association = 'Regular',
    working_presently,
    date_of_leaving,
    experience_years,
    is_hod_principal,
  } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: "Missing faculty id" });
  }

  // Resolve program_id similar to addFaculty
  let resolvedProgramId = null;
  try {
    const [direct] = await pool.execute(
      "SELECT id FROM programname_level_discipline WHERE id = ?",
      [program_id]
    );
    if (direct.length > 0) {
      resolvedProgramId = direct[0].id;
    } else {
      const [byName] = await pool.execute(
        "SELECT id FROM programname_level_discipline WHERE name = ? LIMIT 1",
        [program_id]
      );
      if (byName.length > 0) resolvedProgramId = byName[0].id;
    }

    if (!resolvedProgramId) {
      return res.status(400).json({ success: false, error: "program_id does not correspond to a valid program offering (programname_level_discipline)" });
    }
  } catch (err) {
    console.error("Error resolving program_id for update:", err);
    return res.status(500).json({ success: false, error: "Failed to validate program_id" });
  }

  try {
    const sql = `UPDATE faculty_details SET
      program_id = ?,
      faculty_name = ?,
      pan_no = ?,
      apaar_faculty_id = ?,
      highest_degree = ?,
      university_name = ?,
      area_of_specialization = ?,
      date_of_joining = ?,
      designation_at_joining = ?,
      present_designation = ?,
      date_designated_as_prof = ?,
      date_of_receiving_highest_degree = ?,
      nature_of_association = ?,
      working_presently = ?,
      date_of_leaving = ?,
      experience_years = ?,
      is_hod_principal = ?,
      updated_at = NOW()
      WHERE id = ?`;

    const params = [
      resolvedProgramId,
      faculty_name || null,
      pan_no || null,
      apaar_faculty_id || null,
      highest_degree || null,
      university_name || null,
      area_of_specialization || null,
      date_of_joining || null,
      designation_at_joining || null,
      present_designation || null,
      date_designated_as_prof || null,
      date_of_receiving_highest_degree || null,
      nature_of_association || 'Regular',
      working_presently || null,
      date_of_leaving || null,
      experience_years || null,
      is_hod_principal || null,
      id,
    ];

    const [result] = await pool.query(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Faculty record not found" });
    }

    return res.json({ success: true, message: "Faculty updated" });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

// add updateFaculty to exports
module.exports.updateFaculty = updateFaculty;

