const pool = require("../db");

const DEFAULT_STUDY_YEARS = [2, 3, 4];

const parseAcademicYearStart = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}$/.test(raw)) {
    const start = Number.parseInt(raw.slice(0, 4), 10);
    const yy = Number.parseInt(raw.slice(5, 7), 10);
    if ((start + 1) % 100 !== yy) return null;
    return start;
  }

  if (/^\d{4}$/.test(raw)) {
    return Number.parseInt(raw, 10);
  }

  return null;
};

const formatAcademicYear = (startYear) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const getAcademicYearCandidates = (startYear) => [formatAcademicYear(startYear), String(startYear)];

const toNonNegativeInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return parsed;
};

const toAcademicYearCandidates = (yearLabel) => {
  const start = parseAcademicYearStart(yearLabel);
  if (start === null) return [String(yearLabel || "").trim()];
  return [formatAcademicYear(start), String(start)];
};

const getStudentByDepartment = async (req, res) => {
  try {
    const { program_id, academic_year } = req.query;

    if (!program_id) {
      return res.status(400).json({ success: false, error: "program_id is required" });
    }

    if (!academic_year || String(academic_year).trim() === "") {
      return res.status(400).json({ success: false, error: "academic_year is required" });
    }

    const normalizedProgramId = Number.parseInt(program_id, 10);
    const normalizedAcademicYear = String(academic_year).trim();

    const cayStartYear = parseAcademicYearStart(normalizedAcademicYear);
    if (cayStartYear === null) {
      return res.status(400).json({
        success: false,
        error: "academic_year must be in YYYY-YY or YYYY format",
      });
    }

    const [programIntakeRows] = await pool.execute(
      `SELECT academic_year, current_intake
       FROM intake_details
       WHERE program_id = ?`,
      [normalizedProgramId],
    );

    const currentCay = formatAcademicYear(cayStartYear);
    const previousCay = formatAcademicYear(cayStartYear - 1);
    const twoYearsBackCay = formatAcademicYear(cayStartYear - 2);

    const [entryRows] = await pool.execute(
      `SELECT cay_academic_year, year_of_study, actual_lateral_admitted
       FROM student_by_department
       WHERE program_id = ?
         AND cay_academic_year IN (?, ?, ?)`,
      [normalizedProgramId, currentCay, previousCay, twoYearsBackCay],
    );

    const secondYearByCay = new Map();
    const fallbackByYearOfStudy = new Map();

    entryRows.forEach((row) => {
      const normalizedCay = String(row.cay_academic_year || "").trim();
      const studyYear = Number(row.year_of_study);
      const value = Number(row.actual_lateral_admitted || 0);

      if (studyYear === 2) {
        secondYearByCay.set(normalizedCay, value);
      }
      fallbackByYearOfStudy.set(studyYear, value);
    });

    const currentYearActual =
      secondYearByCay.get(currentCay) ??
      fallbackByYearOfStudy.get(2) ??
      0;

    const thirdYearActual =
      secondYearByCay.get(previousCay) ??
      fallbackByYearOfStudy.get(3) ??
      0;

    const fourthYearActual =
      secondYearByCay.get(twoYearsBackCay) ??
      fallbackByYearOfStudy.get(4) ??
      0;

    const rows = DEFAULT_STUDY_YEARS.map((year) => {
      const yearOffset = year - 1; // 2nd=>1, 3rd=>2, 4th=>3
      const intakeStartYear = cayStartYear - yearOffset;
      const candidates = getAcademicYearCandidates(intakeStartYear);

      const sanctionIntake = programIntakeRows
        .filter((row) => candidates.includes(String(row.academic_year || "").trim()))
        .reduce((sum, row) => sum + (Number.parseInt(row.current_intake, 10) || 0), 0);

      return {
        year_of_study: year,
        intake_academic_year: formatAcademicYear(intakeStartYear),
        sanction_intake: sanctionIntake,
        actual_lateral_admitted:
          year === 2
            ? currentYearActual
            : year === 3
              ? thirdYearActual
              : fourthYearActual,
      };
    });

    const totalSanctionIntake = rows.reduce(
      (sum, row) => sum + (Number.parseInt(row.sanction_intake, 10) || 0),
      0,
    );

    return res.json({
      success: true,
      data: {
        program_id: normalizedProgramId,
        academic_year: normalizedAcademicYear,
        sanction_intake: totalSanctionIntake,
        rows,
      },
    });
  } catch (error) {
    console.error("Error fetching student by department:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch student by department data" });
  }
};

const upsertStudentByDepartment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { program_id, academic_year, rows } = req.body;

    if (!program_id) {
      return res.status(400).json({ success: false, error: "program_id is required" });
    }

    if (!academic_year || String(academic_year).trim() === "") {
      return res.status(400).json({ success: false, error: "academic_year is required" });
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, error: "rows are required" });
    }

    const normalizedProgramId = Number.parseInt(program_id, 10);
    const normalizedAcademicYear = String(academic_year).trim();

    await connection.beginTransaction();

    const secondYearRow = rows.find((row) => Number.parseInt(row.year_of_study, 10) === 2);
    if (!secondYearRow) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: "Only 2nd Year entry is expected for save",
      });
    }

    const actualLateralAdmitted = toNonNegativeInt(secondYearRow.actual_lateral_admitted);

    const [existingRows] = await connection.execute(
      `SELECT id FROM student_by_department
       WHERE program_id = ?
         AND year_of_study = 2
         AND cay_academic_year IN (?, ?)
       LIMIT 1`,
      [normalizedProgramId, normalizedAcademicYear, String(parseAcademicYearStart(normalizedAcademicYear) || "")],
    );

    if (existingRows.length > 0) {
      await connection.execute(
        `UPDATE student_by_department
         SET actual_lateral_admitted = ?,
             cay_academic_year = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [actualLateralAdmitted, normalizedAcademicYear, existingRows[0].id],
      );
    } else {
      await connection.execute(
        `INSERT INTO student_by_department (
          program_id,
          cay_academic_year,
          year_of_study,
          actual_lateral_admitted
        ) VALUES (?, ?, 2, ?)`,
        [normalizedProgramId, normalizedAcademicYear, actualLateralAdmitted],
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: "Student by department data saved successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error saving student by department:", error);
    return res.status(500).json({ success: false, error: "Failed to save student by department data" });
  } finally {
    connection.release();
  }
};

module.exports = {
  getStudentByDepartment,
  upsertStudentByDepartment,
};
