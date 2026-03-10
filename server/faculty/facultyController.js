const pool = require("../db");

const buildFacultyInsertSql = () => `INSERT INTO faculty_details (
  program_id, faculty_name, pan_no, apaar_faculty_id, highest_degree, university_name,
  area_of_specialization, date_of_joining, designation_at_joining, present_designation,
  date_designated_as_prof, date_of_receiving_highest_degree, nature_of_association,
  working_presently, date_of_leaving, experience_years, is_hod_principal, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

const toTrimmedOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
};

const toDateOrNull = (value) => {
  const text = toTrimmedOrNull(value);
  if (!text) return null;
  const normalized = text.replace(/\//g, "-");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return null;
  return normalized;
};

const toDecimalOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeYesNoOrNull = (value) => {
  const text = toTrimmedOrNull(value);
  if (!text) return null;
  const lowered = text.toLowerCase();
  if (lowered === "yes" || lowered === "y" || lowered === "true" || lowered === "1") return "Yes";
  if (lowered === "no" || lowered === "n" || lowered === "false" || lowered === "0") return "No";
  return null;
};

const normalizeAssociation = (value) => {
  const text = toTrimmedOrNull(value);
  if (!text) return "Regular";
  const lowered = text.toLowerCase();
  if (lowered === "regular") return "Regular";
  if (lowered === "contract") return "Contract";
  if (lowered === "visiting") return "Visiting";
  return "Regular";
};

const normalizeFacultyNameKey = (value) => {
  const text = toTrimmedOrNull(value);
  return text ? text.toLowerCase() : "";
};

const normalizeProgramLookupKey = (departmentName, programName) => {
  const d = toTrimmedOrNull(departmentName);
  const p = toTrimmedOrNull(programName);
  if (!d || !p) return "";
  return `${d.toLowerCase()}||${p.toLowerCase()}`;
};

const resolveProgramId = async (programId) => {
  const provided = toTrimmedOrNull(programId);
  if (!provided) {
    return { ok: false, error: "program_id is required" };
  }

  const [direct] = await pool.execute(
    "SELECT id FROM programname_level_discipline WHERE id = ?",
    [provided]
  );

  if (direct.length > 0) {
    return { ok: true, id: direct[0].id };
  }

  const [byName] = await pool.execute(
    "SELECT id FROM programname_level_discipline WHERE name = ? LIMIT 1",
    [provided]
  );

  if (byName.length > 0) {
    return { ok: true, id: byName[0].id };
  }

  return {
    ok: false,
    error: "program_id does not correspond to a valid program offering (programname_level_discipline)",
  };
};

const buildInsertParams = ({
  resolvedProgramId,
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
  nature_of_association,
  working_presently,
  date_of_leaving,
  experience_years,
  is_hod_principal,
}) => [
  resolvedProgramId,
  toTrimmedOrNull(faculty_name),
  toTrimmedOrNull(pan_no),
  toTrimmedOrNull(apaar_faculty_id),
  toTrimmedOrNull(highest_degree),
  toTrimmedOrNull(university_name),
  toTrimmedOrNull(area_of_specialization),
  toDateOrNull(date_of_joining),
  toTrimmedOrNull(designation_at_joining),
  toTrimmedOrNull(present_designation),
  toDateOrNull(date_designated_as_prof),
  toDateOrNull(date_of_receiving_highest_degree),
  normalizeAssociation(nature_of_association),
  normalizeYesNoOrNull(working_presently),
  toDateOrNull(date_of_leaving),
  toDecimalOrNull(experience_years),
  normalizeYesNoOrNull(is_hod_principal),
];

const academicYearPattern = /^\d{4}-\d{2}$/;

const parseAcademicYear = (academicYear) => {
  if (!academicYear || !academicYearPattern.test(academicYear)) {
    return null;
  }

  const startYear = Number.parseInt(academicYear.slice(0, 4), 10);
  const endYearTwoDigits = Number.parseInt(academicYear.slice(5, 7), 10);

  if ((startYear + 1) % 100 !== endYearTwoDigits) {
    return null;
  }

  return {
    label: academicYear,
    startYear,
  };
};

const formatAcademicYear = (startYear) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const buildAcademicWindow = (startYear) => ({
  label: formatAcademicYear(startYear),
  windowStart: `${startYear}-08-31`,
  windowEnd: `${startYear + 1}-04-25`,
});

const normalizeAssociationBucket = (value) => {
  const text = toTrimmedOrNull(value);
  return text && text.toLowerCase() === "contract" ? "contract" : "regular";
};

const isProfessorDesignation = (designation) => {
  const text = toTrimmedOrNull(designation)?.toLowerCase() || "";
  return text.includes("professor") && !text.includes("associate") && !text.includes("assistant");
};

const isAssociateDesignation = (designation) => {
  const text = toTrimmedOrNull(designation)?.toLowerCase() || "";
  return text.includes("associate") && text.includes("professor");
};

const isAssistantDesignation = (designation) => {
  const text = toTrimmedOrNull(designation)?.toLowerCase() || "";
  return text.includes("assistant") && text.includes("professor");
};

const isPhdDegree = (degree) => {
  const text = toTrimmedOrNull(degree)?.toLowerCase() || "";
  return /ph\s*\.?\s*d/.test(text);
};

const resolveDesignationBucket = (designation) => {
  if (isProfessorDesignation(designation)) return "Professor";
  if (isAssociateDesignation(designation)) return "Associate Professor";
  if (isAssistantDesignation(designation)) return "Assistant Professor";
  return null;
};

const resolveDesignationBucketForWindow = (facultyRow, windowStart) => {
  const presentBucket = resolveDesignationBucket(facultyRow.present_designation);
  if (presentBucket !== "Professor") {
    return presentBucket;
  }

  const profDesignationDate = toDateOrNull(facultyRow.date_designated_as_prof);
  if (profDesignationDate && profDesignationDate > windowStart) {
    // Promotions after Aug 31 are deferred to next AY and counted in prior bucket.
    return resolveDesignationBucket(facultyRow.designation_at_joining);
  }

  return "Professor";
};

const initializeStatsRows = () => ({
  Professor: { regular: 0, contract: 0 },
  "Associate Professor": { regular: 0, contract: 0 },
  "Assistant Professor": { regular: 0, contract: 0 },
  "Number of Ph.D": { regular: 0, contract: 0 },
});

const toDisplayCell = ({ regular, contract }) => ({
  regular,
  contract,
  total: regular + contract,
  display: `${regular}(R) + ${contract}(C)`,
});

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

  try {
    const resolved = await resolveProgramId(program_id);
    if (!resolved.ok) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const sql = buildFacultyInsertSql();
    const params = buildInsertParams({
      resolvedProgramId: resolved.id,
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
      nature_of_association,
      working_presently,
      date_of_leaving,
      experience_years,
      is_hod_principal,
    });

    const [result] = await pool.query(sql, params);

    return res.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Error adding faculty:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

/**
 * Bulk add faculty records from parsed Excel rows
 */
const bulkAddFaculty = async (req, res) => {
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : null;

  if (!rows || rows.length === 0) {
    return res.status(400).json({
      success: false,
      error: "rows array is required for bulk import",
    });
  }

  try {
    const [programRows] = await pool.execute(
      `SELECT
        pld.id AS programId,
        ap.department_name AS departmentName,
        pn.coursename AS programName
      FROM all_program ap
      INNER JOIN program_name pn ON ap.programname = pn.id
      INNER JOIN programname_level_discipline pld
        ON pld.name = ap.programname AND pld.level = ap.level AND pld.discipline = ap.discipline`
    );

    const programLookup = new Map();
    for (const row of programRows) {
      const key = normalizeProgramLookupKey(row.departmentName, row.programName);
      if (!key) continue;
      if (!programLookup.has(key)) {
        programLookup.set(key, new Set());
      }
      programLookup.get(key).add(row.programId);
    }

    const candidateProgramIds = new Set();
    const rowContexts = rows.map((rawRow, index) => {
      const rowNumber = Number(rawRow?.row_number || rawRow?.__rowNumber || index + 2);
      const departmentName = toTrimmedOrNull(rawRow?.department_name);
      const programName = toTrimmedOrNull(rawRow?.program_name);
      const facultyName = toTrimmedOrNull(rawRow?.faculty_name);
      const key = normalizeProgramLookupKey(departmentName, programName);
      const programCandidates = key && programLookup.has(key) ? Array.from(programLookup.get(key)) : [];
      if (programCandidates.length === 1) {
        candidateProgramIds.add(programCandidates[0]);
      }

      return {
        rawRow,
        rowNumber,
        departmentName,
        programName,
        facultyName,
        key,
        programCandidates,
      };
    });

    const existingFacultyKeys = new Set();
    if (candidateProgramIds.size > 0) {
      const ids = Array.from(candidateProgramIds);
      const placeholders = ids.map(() => "?").join(",");
      const [existingRows] = await pool.query(
        `SELECT program_id, faculty_name FROM faculty_details WHERE program_id IN (${placeholders})`,
        ids
      );

      for (const existing of existingRows) {
        const nameKey = normalizeFacultyNameKey(existing.faculty_name);
        if (nameKey) {
          existingFacultyKeys.add(`${existing.program_id}||${nameKey}`);
        }
      }
    }

    const sql = buildFacultyInsertSql();
    const insertedIds = [];
    const issues = [];
    let insertedCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (const context of rowContexts) {
      const { rawRow, rowNumber, departmentName, programName, facultyName, programCandidates } = context;

      if (!departmentName || !programName || !facultyName) {
        invalidCount += 1;
        const errorMsg = "department_name, program_name, and faculty_name are required";
        console.log(`[Row ${rowNumber}] INVALID: ${errorMsg}`, {
          department_name: departmentName,
          program_name: programName,
          faculty_name: facultyName
        });
        issues.push({
          rowNumber,
          type: "invalid",
          message: errorMsg,
        });
        continue;
      }

      if (programCandidates.length === 0) {
        invalidCount += 1;
        const errorMsg = `No program mapping found for department '${departmentName}' and program '${programName}'`;
        console.log(`[Row ${rowNumber}] INVALID: ${errorMsg}`);
        issues.push({
          rowNumber,
          type: "invalid",
          message: errorMsg,
        });
        continue;
      }

      if (programCandidates.length > 1) {
        invalidCount += 1;
        const errorMsg = `Ambiguous mapping for department '${departmentName}' and program '${programName}'. Please use a unique program combination.`;
        console.log(`[Row ${rowNumber}] INVALID: ${errorMsg}`, {
          candidateProgramIds: programCandidates
        });
        issues.push({
          rowNumber,
          type: "invalid",
          message: errorMsg,
        });
        continue;
      }

      const resolvedProgramId = programCandidates[0];
      const duplicateKey = `${resolvedProgramId}||${normalizeFacultyNameKey(facultyName)}`;

      if (existingFacultyKeys.has(duplicateKey)) {
        duplicateCount += 1;
        const errorMsg = `Faculty '${facultyName}' already exists for the selected program`;
        console.log(`[Row ${rowNumber}] DUPLICATE: ${errorMsg}`, {
          program_id: resolvedProgramId,
          faculty_name: facultyName
        });
        issues.push({
          rowNumber,
          type: "duplicate",
          message: errorMsg,
        });
        continue;
      }

      try {
        const params = buildInsertParams({
          resolvedProgramId,
          faculty_name: facultyName,
          pan_no: rawRow?.pan_no,
          apaar_faculty_id: rawRow?.apaar_faculty_id,
          highest_degree: rawRow?.highest_degree,
          university_name: rawRow?.university_name,
          area_of_specialization: rawRow?.area_of_specialization,
          date_of_joining: rawRow?.date_of_joining,
          designation_at_joining: rawRow?.designation_at_joining,
          present_designation: rawRow?.present_designation,
          date_designated_as_prof: rawRow?.date_designated_as_prof,
          date_of_receiving_highest_degree: rawRow?.date_of_receiving_highest_degree,
          nature_of_association: rawRow?.nature_of_association,
          working_presently: rawRow?.working_presently,
          date_of_leaving: rawRow?.date_of_leaving,
          experience_years: rawRow?.experience_years,
          is_hod_principal: rawRow?.is_hod_principal,
        });

        const [result] = await pool.query(sql, params);
        insertedCount += 1;
        insertedIds.push(result.insertId);
        existingFacultyKeys.add(duplicateKey);
      } catch (insertError) {
        invalidCount += 1;
        const errorMsg = `Failed to insert row: ${insertError.message}`;
        console.log(`[Row ${rowNumber}] INSERT ERROR: ${errorMsg}`, {
          faculty_name: facultyName,
          program_id: resolvedProgramId,
          error: insertError
        });
        issues.push({
          rowNumber,
          type: "invalid",
          message: errorMsg,
        });
      }
    }

    return res.json({
      success: true,
      message: "Bulk import completed",
      summary: {
        totalRows: rows.length,
        insertedCount,
        duplicateCount,
        invalidCount,
      },
      insertedIds,
      issues,
    });
  } catch (error) {
    console.error("Error in bulk faculty import:", error);
    return res.status(500).json({
      success: false,
      error: "Bulk import failed",
    });
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

    sql += ` ORDER BY 
      CASE WHEN f.is_hod_principal = 'Yes' THEN 0 ELSE 1 END,
      CASE 
        WHEN f.present_designation LIKE '%Professor%' AND f.present_designation NOT LIKE '%Associate%' AND f.present_designation NOT LIKE '%Assistant%' THEN 1
        WHEN f.present_designation LIKE '%Associate%Professor%' THEN 2
        WHEN f.present_designation LIKE '%Assistant%Professor%' THEN 3
        ELSE 4
      END,
      CASE WHEN f.experience_years IS NULL THEN 1 ELSE 0 END,
      f.experience_years DESC`;

    const [rows] = await pool.query(sql, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching faculty:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
};

/**
 * Get designation-wise faculty counts for CAY/CAYm1/CAYm2 using AY window rules.
 */
const getFacultyDesignationStats = async (req, res) => {
  const { program_id, academicYear } = req.query;

  if (!program_id) {
    return res.status(400).json({ success: false, error: "program_id is required" });
  }

  const parsedAcademicYear = parseAcademicYear(academicYear);
  if (!parsedAcademicYear) {
    return res.status(400).json({ success: false, error: "academicYear must be in YYYY-YY format" });
  }

  try {
    const resolved = await resolveProgramId(program_id);
    if (!resolved.ok) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

    const windows = [
      { key: "CAY", ...buildAcademicWindow(parsedAcademicYear.startYear) },
      { key: "CAYm1", ...buildAcademicWindow(parsedAcademicYear.startYear - 1) },
      { key: "CAYm2", ...buildAcademicWindow(parsedAcademicYear.startYear - 2) },
    ];

    const statsByWindowKey = {
      CAY: initializeStatsRows(),
      CAYm1: initializeStatsRows(),
      CAYm2: initializeStatsRows(),
    };

    for (const window of windows) {
      const [rows] = await pool.execute(
        `SELECT present_designation, designation_at_joining, date_designated_as_prof, highest_degree, nature_of_association
         FROM faculty_details
         WHERE program_id = ?
           AND date_of_joining IS NOT NULL
           AND date_of_joining <= ?
           AND (date_of_leaving IS NULL OR date_of_leaving > ?)`,
        [resolved.id, window.windowStart, window.windowEnd],
      );

      for (const row of rows) {
        const associationBucket = normalizeAssociationBucket(row.nature_of_association);
        const designationBucket = resolveDesignationBucketForWindow(row, window.windowStart);

        if (designationBucket) {
          statsByWindowKey[window.key][designationBucket][associationBucket] += 1;
          if (isPhdDegree(row.highest_degree)) {
            // Keep Ph.D count consistent with designation-eligible faculty for the AY window.
            statsByWindowKey[window.key]["Number of Ph.D"][associationBucket] += 1;
          }
        }
      }
    }

    const rowOrder = ["Professor", "Associate Professor", "Assistant Professor", "Number of Ph.D"];
    const rows = rowOrder.map((designation) => ({
      designation,
      CAY: toDisplayCell(statsByWindowKey.CAY[designation]),
      CAYm1: toDisplayCell(statsByWindowKey.CAYm1[designation]),
      CAYm2: toDisplayCell(statsByWindowKey.CAYm2[designation]),
    }));

    return res.json({
      success: true,
      data: {
        labels: {
          CAY: windows[0].label,
          CAYm1: windows[1].label,
          CAYm2: windows[2].label,
        },
        rows,
      },
    });
  } catch (error) {
    console.error("Error fetching faculty designation stats:", error);
    return res.status(500).json({ success: false, error: "Database error" });
  }
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

  try {
    const resolved = await resolveProgramId(program_id);
    if (!resolved.ok) {
      return res.status(400).json({ success: false, error: resolved.error });
    }

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
      resolved.id,
      toTrimmedOrNull(faculty_name),
      toTrimmedOrNull(pan_no),
      toTrimmedOrNull(apaar_faculty_id),
      toTrimmedOrNull(highest_degree),
      toTrimmedOrNull(university_name),
      toTrimmedOrNull(area_of_specialization),
      toDateOrNull(date_of_joining),
      toTrimmedOrNull(designation_at_joining),
      toTrimmedOrNull(present_designation),
      toDateOrNull(date_designated_as_prof),
      toDateOrNull(date_of_receiving_highest_degree),
      normalizeAssociation(nature_of_association),
      normalizeYesNoOrNull(working_presently),
      toDateOrNull(date_of_leaving),
      toDecimalOrNull(experience_years),
      normalizeYesNoOrNull(is_hod_principal),
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

module.exports = {
  addFaculty,
  bulkAddFaculty,
  getFaculty,
  getFacultyDesignationStats,
  updateFaculty,
};

