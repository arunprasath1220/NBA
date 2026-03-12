const pool = require("../db");

const toNullableInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const YEAR_MIN = 1901;
const YEAR_MAX = 2155;

const toNullableYear = (value) => {
  if (value === undefined || value === null || value === "") {
    return { value: null, invalid: false };
  }

  const raw = String(value).trim();
  const yearToken = /^\d{4}$/.test(raw)
    ? raw
    : /^\d{4}-\d{2}$/.test(raw)
      ? raw.slice(0, 4)
      : null;

  if (!yearToken) {
    return { value: null, invalid: true };
  }

  const year = Number.parseInt(yearToken, 10);
  if (!Number.isFinite(year) || year < YEAR_MIN || year > YEAR_MAX) {
    return { value: null, invalid: true };
  }

  return { value: year, invalid: false };
};

const toTinyIntBool = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "yes") return 1;
  if (normalized === "no") return 0;
  return null;
};

const fromTinyIntBool = (value) => (Number(value) === 1 ? "Yes" : "No");

const addIntake = async (req, res) => {
  try {
    const {
      program_id,
      year_of_aicte_approval,
      initial_intake,
      intake_increase,
      current_intake,
      accreditation_status,
      accreditation_from,
      accreditation_to,
      program_for_consideration,
      program_duration,
      academic_year,
    } = req.body;

    if (!program_id) {
      return res.status(400).json({ success: false, error: "program_id is required" });
    }

    if (!academic_year || String(academic_year).trim() === "") {
      return res.status(400).json({ success: false, error: "academic_year is required" });
    }

    const programForConsiderationValue = toTinyIntBool(program_for_consideration);
    if (programForConsiderationValue === null) {
      return res.status(400).json({ success: false, error: "program_for_consideration must be Yes or No" });
    }

    const aicteApprovalYear = toNullableYear(year_of_aicte_approval);
    const accreditationFromYear = toNullableYear(accreditation_from);
    const accreditationToYear = toNullableYear(accreditation_to);

    if (aicteApprovalYear.invalid) {
      return res.status(400).json({
        success: false,
        error: "year_of_aicte_approval must be a valid 4-digit year",
      });
    }

    if (accreditationFromYear.invalid) {
      return res.status(400).json({
        success: false,
        error: "accreditation_from must be a valid 4-digit year",
      });
    }

    if (accreditationToYear.invalid) {
      return res.status(400).json({
        success: false,
        error: "accreditation_to must be a valid 4-digit year",
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO intake_details (
        program_id,
        year_of_aicte_approval,
        initial_intake,
        intake_increase,
        current_intake,
        accreditation_status,
        accreditation_from,
        accreditation_to,
        program_for_consideration,
        program_duration,
        academic_year
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number.parseInt(program_id, 10),
        aicteApprovalYear.value,
        toNullableInt(initial_intake),
        toNullableInt(intake_increase),
        toNullableInt(current_intake),
        accreditation_status || null,
        accreditationFromYear.value,
        accreditationToYear.value,
        programForConsiderationValue,
        toNullableInt(program_duration),
        String(academic_year).trim(),
      ],
    );

    const [rows] = await pool.execute(
      `SELECT
        i.id,
        i.program_id,
        ap.department_name AS program_name,
        pl.level AS program_level,
        i.year_of_aicte_approval,
        i.initial_intake,
        i.intake_increase,
        i.current_intake,
        i.accreditation_status,
        i.accreditation_from,
        i.accreditation_to,
        i.program_for_consideration,
        i.program_duration,
        i.academic_year,
        i.created_at,
        i.updated_at
      FROM intake_details i
      LEFT JOIN all_program ap ON ap.id = i.program_id
      LEFT JOIN program_level pl ON pl.id = ap.level
      WHERE i.id = ?`,
      [result.insertId],
    );

    const intake = rows[0]
      ? {
          ...rows[0],
          program_for_consideration: fromTinyIntBool(rows[0].program_for_consideration),
          intake_increase: Number(rows[0].intake_increase) > 0 ? "Yes" : "No",
        }
      : null;

    return res.status(201).json({
      success: true,
      message: "Intake details saved successfully",
      data: intake,
    });
  } catch (error) {
    console.error("Error saving intake details:", error);
    return res.status(500).json({ success: false, error: "Failed to save intake details" });
  }
};

const getIntake = async (req, res) => {
  try {
    const { program_id, academic_year } = req.query;

    const conditions = [];
    const params = [];

    if (program_id) {
      conditions.push("i.program_id = ?");
      params.push(Number.parseInt(program_id, 10));
    }

    if (academic_year) {
      conditions.push("i.academic_year = ?");
      params.push(String(academic_year).trim());
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows] = await pool.execute(
      `SELECT
        i.id,
        i.program_id,
        ap.department_name AS program_name,
        pl.level AS program_level,
        i.year_of_aicte_approval,
        i.initial_intake,
        i.intake_increase,
        i.current_intake,
        i.accreditation_status,
        i.accreditation_from,
        i.accreditation_to,
        i.program_for_consideration,
        i.program_duration,
        i.academic_year,
        i.created_at,
        i.updated_at
      FROM intake_details i
      LEFT JOIN all_program ap ON ap.id = i.program_id
      LEFT JOIN program_level pl ON pl.id = ap.level
      ${whereClause}
      ORDER BY i.id DESC`,
      params,
    );

    const data = rows.map((row) => ({
      ...row,
      program_for_consideration: fromTinyIntBool(row.program_for_consideration),
      intake_increase: Number(row.intake_increase) > 0 ? "Yes" : "No",
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error("Error fetching intake details:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch intake details" });
  }
};

const updateIntake = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      program_id,
      year_of_aicte_approval,
      initial_intake,
      intake_increase,
      current_intake,
      accreditation_status,
      accreditation_from,
      accreditation_to,
      program_for_consideration,
      program_duration,
      academic_year,
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    const updateFields = [];
    const params = [];

    if (program_id !== undefined) {
      updateFields.push("program_id = ?");
      params.push(Number.parseInt(program_id, 10));
    }

    if (year_of_aicte_approval !== undefined) {
      const aicteApprovalYear = toNullableYear(year_of_aicte_approval);
      if (aicteApprovalYear.invalid) {
        return res.status(400).json({
          success: false,
          error: "year_of_aicte_approval must be a valid 4-digit year",
        });
      }
      updateFields.push("year_of_aicte_approval = ?");
      params.push(aicteApprovalYear.value);
    }

    if (initial_intake !== undefined) {
      updateFields.push("initial_intake = ?");
      params.push(toNullableInt(initial_intake));
    }

    if (intake_increase !== undefined) {
      updateFields.push("intake_increase = ?");
      params.push(toNullableInt(intake_increase));
    }

    if (current_intake !== undefined) {
      updateFields.push("current_intake = ?");
      params.push(toNullableInt(current_intake));
    }

    if (accreditation_status !== undefined) {
      updateFields.push("accreditation_status = ?");
      params.push(accreditation_status || null);
    }

    if (accreditation_from !== undefined) {
      const accreditationFromYear = toNullableYear(accreditation_from);
      if (accreditationFromYear.invalid) {
        return res.status(400).json({
          success: false,
          error: "accreditation_from must be a valid 4-digit year",
        });
      }
      updateFields.push("accreditation_from = ?");
      params.push(accreditationFromYear.value);
    }

    if (accreditation_to !== undefined) {
      const accreditationToYear = toNullableYear(accreditation_to);
      if (accreditationToYear.invalid) {
        return res.status(400).json({
          success: false,
          error: "accreditation_to must be a valid 4-digit year",
        });
      }
      updateFields.push("accreditation_to = ?");
      params.push(accreditationToYear.value);
    }

    if (program_for_consideration !== undefined) {
      const programForConsiderationValue = toTinyIntBool(program_for_consideration);
      if (programForConsiderationValue === null) {
        return res.status(400).json({
          success: false,
          error: "program_for_consideration must be Yes or No",
        });
      }
      updateFields.push("program_for_consideration = ?");
      params.push(programForConsiderationValue);
    }

    if (program_duration !== undefined) {
      updateFields.push("program_duration = ?");
      params.push(toNullableInt(program_duration));
    }

    if (academic_year !== undefined) {
      updateFields.push("academic_year = ?");
      params.push(String(academic_year).trim());
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    params.push(Number.parseInt(id, 10));

    await pool.execute(
      `UPDATE intake_details SET ${updateFields.join(", ")} WHERE id = ?`,
      params,
    );

    const [rows] = await pool.execute(
      `SELECT
        i.id,
        i.program_id,
        ap.department_name AS program_name,
        pl.level AS program_level,
        i.year_of_aicte_approval,
        i.initial_intake,
        i.intake_increase,
        i.current_intake,
        i.accreditation_status,
        i.accreditation_from,
        i.accreditation_to,
        i.program_for_consideration,
        i.program_duration,
        i.academic_year,
        i.created_at,
        i.updated_at
      FROM intake_details i
      LEFT JOIN all_program ap ON ap.id = i.program_id
      LEFT JOIN program_level pl ON pl.id = ap.level
      WHERE i.id = ?`,
      [Number.parseInt(id, 10)],
    );

    const intake = rows[0]
      ? {
          ...rows[0],
          program_for_consideration: fromTinyIntBool(rows[0].program_for_consideration),
          intake_increase: Number(rows[0].intake_increase) > 0 ? "Yes" : "No",
        }
      : null;

    return res.json({
      success: true,
      message: "Intake details updated successfully",
      data: intake,
    });
  } catch (error) {
    console.error("Error updating intake details:", error);
    return res.status(500).json({ success: false, error: "Failed to update intake details" });
  }
};

const deleteIntake = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "id is required" });
    }

    await pool.execute("DELETE FROM intake_details WHERE id = ?", [Number.parseInt(id, 10)]);

    return res.json({
      success: true,
      message: "Intake details deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting intake details:", error);
    return res.status(500).json({ success: false, error: "Failed to delete intake details" });
  }
};

module.exports = {
  addIntake,
  getIntake,
  updateIntake,
  deleteIntake,
};
