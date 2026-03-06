const pool = require("../db");

/**
 * Get Program Levels
 * Returns all program levels from the program_level table
 */
const getProgramLevels = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, level FROM program_level ORDER BY level ASC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching program levels:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch program levels",
    });
  }
};

/**
 * Get Programs by Level
 * Returns all programs from all_program table filtered by level
 * Each program includes id, programName, and departmentName
 */
const getProgramsByLevel = async (req, res) => {
  try {
    const { levelId } = req.params;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level ID is required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT 
        ap.id,
        ap.programname as programNameId,
        pn.coursename as programName,
        ap.department_name as departmentName
      FROM all_program ap
      LEFT JOIN program_name pn ON ap.programname = pn.id
      WHERE ap.level = ?
      ORDER BY pn.coursename ASC`,
      [parseInt(levelId)]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching programs by level:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch programs",
    });
  }
};

/**
 * Get Program Details (Department Name)
 * Returns department name for a specific program from all_program table
 */
const getProgramDepartment = async (req, res) => {
  try {
    const { programId } = req.params;

    if (!programId) {
      return res.status(400).json({
        success: false,
        error: "Program ID is required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT department_name as departmentName 
       FROM all_program 
       WHERE id = ?`,
      [parseInt(programId)]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: { departmentName: "" },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching program department:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch program department",
    });
  }
};

/**
 * Get All Unique Departments
 * Returns all unique department names from all_program table
 */
const getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT DISTINCT department_name as departmentName 
       FROM all_program 
       WHERE department_name IS NOT NULL AND department_name != ''
       ORDER BY department_name ASC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};

/**
 * Get Departments by Level
 * Returns all unique department names from all_program table filtered by level
 */
const getDepartmentsByLevel = async (req, res) => {
  try {
    const { levelId } = req.params;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level ID is required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT DISTINCT department_name as departmentName 
       FROM all_program 
       WHERE level = ? AND department_name IS NOT NULL AND department_name != ''
       ORDER BY department_name ASC`,
      [parseInt(levelId)]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching departments by level:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch departments",
    });
  }
};

/**
 * Get Programs by Level and Department
 * Returns all programs from all_program table filtered by level and department
 */
const getProgramsByLevelAndDepartment = async (req, res) => {
  try {
    const { levelId, departmentName } = req.params;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level ID is required",
      });
    }

    if (!departmentName) {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }

    const [rows] = await pool.execute(
      `SELECT 
        ap.id,
        ap.programname as programNameId,
        pn.coursename as programName,
        ap.department_name as departmentName
      FROM all_program ap
      LEFT JOIN program_name pn ON ap.programname = pn.id
      WHERE ap.level = ? AND ap.department_name = ?
      ORDER BY pn.coursename ASC`,
      [parseInt(levelId), decodeURIComponent(departmentName)]
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching programs by level and department:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch programs",
    });
  }
};

/**
 * Get All Allied Course Mappings
 * Returns all allied course mappings with joined data
 */
const getAllAlliedMappings = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        acm.id,
        acm.program_id as programId,
        acm.level_id as levelId,
        acm.has_allied_department as hasAlliedDepartment,
        acm.allied_level_id as alliedLevelId,
        acm.allied_department_name as alliedDepartmentName,
        acm.allied_program_id as alliedProgramId,
        pl.level as programLevel,
        pn.coursename as programName,
        ap.department_name as departmentName,
        pl2.level as alliedProgramLevel,
        pn2.coursename as alliedProgramName
      FROM allied_course_mapping acm
      LEFT JOIN program_level pl ON acm.level_id = pl.id
      LEFT JOIN all_program ap ON acm.program_id = ap.id
      LEFT JOIN program_name pn ON ap.programname = pn.id
      LEFT JOIN program_level pl2 ON acm.allied_level_id = pl2.id
      LEFT JOIN all_program ap2 ON acm.allied_program_id = ap2.id
      LEFT JOIN program_name pn2 ON ap2.programname = pn2.id
      ORDER BY acm.id DESC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching allied mappings:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch allied mappings",
    });
  }
};

/**
 * Add Allied Course Mapping
 * Creates a new allied course mapping
 */
const addAlliedMapping = async (req, res) => {
  try {
    const { 
      levelId, 
      programId, 
      hasAlliedDepartment,
      alliedLevelId,
      alliedDepartmentName,
      alliedProgramId
    } = req.body;

    // Validate required fields
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Program level is required",
      });
    }
    if (!programId) {
      return res.status(400).json({
        success: false,
        error: "Program name is required",
      });
    }
    if (!hasAlliedDepartment) {
      return res.status(400).json({
        success: false,
        error: "Allied department selection is required",
      });
    }

    // If "Yes" is selected, validate allied fields
    if (hasAlliedDepartment === "Yes") {
      if (!alliedLevelId) {
        return res.status(400).json({
          success: false,
          error: "Allied program level is required",
        });
      }
      if (!alliedDepartmentName) {
        return res.status(400).json({
          success: false,
          error: "Allied department name is required",
        });
      }
      if (!alliedProgramId) {
        return res.status(400).json({
          success: false,
          error: "Allied program name is required",
        });
      }
    }

    // Check if mapping already exists for this program
    const [existing] = await pool.execute(
      "SELECT id FROM allied_course_mapping WHERE program_id = ?",
      [parseInt(programId)]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Allied mapping already exists for this program",
      });
    }

    // Insert the mapping
    const [result] = await pool.execute(
      `INSERT INTO allied_course_mapping (level_id, program_id, has_allied_department, allied_level_id, allied_department_name, allied_program_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        parseInt(levelId),
        parseInt(programId),
        hasAlliedDepartment,
        hasAlliedDepartment === "Yes" ? parseInt(alliedLevelId) : null,
        hasAlliedDepartment === "Yes" ? alliedDepartmentName : null,
        hasAlliedDepartment === "Yes" ? parseInt(alliedProgramId) : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Allied course mapping added successfully",
      data: {
        id: result.insertId,
        levelId: parseInt(levelId),
        programId: parseInt(programId),
        hasAlliedDepartment,
        alliedLevelId: hasAlliedDepartment === "Yes" ? parseInt(alliedLevelId) : null,
        alliedDepartmentName: hasAlliedDepartment === "Yes" ? alliedDepartmentName : null,
        alliedProgramId: hasAlliedDepartment === "Yes" ? parseInt(alliedProgramId) : null,
      },
    });
  } catch (error) {
    console.error("Error adding allied mapping:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add allied mapping",
    });
  }
};

/**
 * Update Allied Course Mapping
 * Updates an existing allied course mapping
 */
const updateAlliedMapping = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      levelId, 
      programId, 
      hasAlliedDepartment,
      alliedLevelId,
      alliedDepartmentName,
      alliedProgramId
    } = req.body;

    // Validate required fields
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Program level is required",
      });
    }
    if (!programId) {
      return res.status(400).json({
        success: false,
        error: "Program name is required",
      });
    }
    if (!hasAlliedDepartment) {
      return res.status(400).json({
        success: false,
        error: "Allied department selection is required",
      });
    }

    // If "Yes" is selected, validate allied fields
    if (hasAlliedDepartment === "Yes") {
      if (!alliedLevelId) {
        return res.status(400).json({
          success: false,
          error: "Allied program level is required",
        });
      }
      if (!alliedDepartmentName) {
        return res.status(400).json({
          success: false,
          error: "Allied department name is required",
        });
      }
      if (!alliedProgramId) {
        return res.status(400).json({
          success: false,
          error: "Allied program name is required",
        });
      }
    }

    // Check if the mapping exists
    const [existing] = await pool.execute(
      "SELECT id FROM allied_course_mapping WHERE id = ?",
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Allied mapping not found",
      });
    }

    // Update the mapping
    await pool.execute(
      `UPDATE allied_course_mapping 
       SET level_id = ?, program_id = ?, has_allied_department = ?, allied_level_id = ?, allied_department_name = ?, allied_program_id = ?
       WHERE id = ?`,
      [
        parseInt(levelId),
        parseInt(programId),
        hasAlliedDepartment,
        hasAlliedDepartment === "Yes" ? parseInt(alliedLevelId) : null,
        hasAlliedDepartment === "Yes" ? alliedDepartmentName : null,
        hasAlliedDepartment === "Yes" ? parseInt(alliedProgramId) : null,
        parseInt(id),
      ]
    );

    res.json({
      success: true,
      message: "Allied course mapping updated successfully",
    });
  } catch (error) {
    console.error("Error updating allied mapping:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update allied mapping",
    });
  }
};

/**
 * Delete Allied Course Mapping
 * Deletes an existing allied course mapping
 */
const deleteAlliedMapping = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the mapping exists
    const [existing] = await pool.execute(
      "SELECT id FROM allied_course_mapping WHERE id = ?",
      [parseInt(id)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Allied mapping not found",
      });
    }

    // Delete the mapping
    await pool.execute(
      "DELETE FROM allied_course_mapping WHERE id = ?",
      [parseInt(id)]
    );

    res.json({
      success: true,
      message: "Allied course mapping deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting allied mapping:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete allied mapping",
    });
  }
};

module.exports = {
  getProgramLevels,
  getProgramsByLevel,
  getProgramDepartment,
  getAllDepartments,
  getDepartmentsByLevel,
  getProgramsByLevelAndDepartment,
  getAllAlliedMappings,
  addAlliedMapping,
  updateAlliedMapping,
  deleteAlliedMapping,
};
