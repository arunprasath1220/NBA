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
 * Returns all allied course groups with their mapped programs
 */
const getAllAlliedMappings = async (req, res) => {
  try {
    // Get all groups with their programs
    const [groups] = await pool.execute(
      `SELECT 
        acg.id as groupId,
        acg.created_at as createdAt
      FROM allied_course_group acg
      ORDER BY acg.id DESC`
    );

    // For each group, get all programs
    const result = [];
    for (const group of groups) {
      const [programs] = await pool.execute(
        `SELECT 
          acm.id as mappingId,
          acm.program_id as programId,
          pl.level as programLevel,
          pl.id as levelId,
          pn.coursename as programName,
          ap.department_name as departmentName
        FROM allied_course_mapping acm
        LEFT JOIN all_program ap ON acm.program_id = ap.id
        LEFT JOIN program_level pl ON ap.level = pl.id
        LEFT JOIN program_name pn ON ap.programname = pn.id
        WHERE acm.group_id = ?
        ORDER BY acm.id ASC`,
        [group.groupId]
      );

      if (programs.length > 0) {
        result.push({
          groupId: group.groupId,
          createdAt: group.createdAt,
          programs: programs,
          // First program is the main program
          mainProgram: programs[0],
          // Rest are allied programs
          alliedPrograms: programs.slice(1),
        });
      }
    }

    res.json({
      success: true,
      data: result,
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
 * Creates a new allied course group and maps programs to it
 */
const addAlliedMapping = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      programId, 
      hasAlliedDepartment,
      alliedProgramId
    } = req.body;

    // Validate required fields
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

    // If "Yes" is selected, validate allied program
    if (hasAlliedDepartment === "Yes") {
      if (!alliedProgramId) {
        return res.status(400).json({
          success: false,
          error: "Allied program name is required",
        });
      }
    }

    // Check if main program is already in a group
    const [existingMain] = await pool.execute(
      "SELECT id, group_id FROM allied_course_mapping WHERE program_id = ?",
      [parseInt(programId)]
    );

    if (existingMain.length > 0) {
      return res.status(400).json({
        success: false,
        error: "This program is already part of an allied group",
      });
    }

    // If allied program is selected, check if it's already in a group
    if (hasAlliedDepartment === "Yes" && alliedProgramId) {
      const [existingAllied] = await pool.execute(
        "SELECT id, group_id FROM allied_course_mapping WHERE program_id = ?",
        [parseInt(alliedProgramId)]
      );

      if (existingAllied.length > 0) {
        return res.status(400).json({
          success: false,
          error: "The allied program is already part of another allied group",
        });
      }
    }

    // Start transaction
    await connection.beginTransaction();

    // Create a new allied course group
    const [groupResult] = await connection.execute(
      "INSERT INTO allied_course_group () VALUES ()"
    );
    const groupId = groupResult.insertId;

    // Insert the main program into the mapping
    await connection.execute(
      "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
      [groupId, parseInt(programId)]
    );

    // If allied program is selected, insert it too
    if (hasAlliedDepartment === "Yes" && alliedProgramId) {
      await connection.execute(
        "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
        [groupId, parseInt(alliedProgramId)]
      );
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Allied course mapping added successfully",
      data: {
        groupId: groupId,
        programId: parseInt(programId),
        alliedProgramId: hasAlliedDepartment === "Yes" ? parseInt(alliedProgramId) : null,
      },
    });
  } catch (error) {
    // Rollback on error
    await connection.rollback();
    console.error("Error adding allied mapping:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add allied mapping",
    });
  } finally {
    connection.release();
  }
};

/**
 * Update Allied Course Mapping
 * Updates an existing allied course group
 */
const updateAlliedMapping = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { groupId } = req.params;
    const { 
      programId, 
      hasAlliedDepartment,
      alliedProgramId
    } = req.body;

    // Validate required fields
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

    // If "Yes" is selected, validate allied program
    if (hasAlliedDepartment === "Yes") {
      if (!alliedProgramId) {
        return res.status(400).json({
          success: false,
          error: "Allied program name is required",
        });
      }
    }

    // Check if the group exists
    const [existingGroup] = await pool.execute(
      "SELECT id FROM allied_course_group WHERE id = ?",
      [parseInt(groupId)]
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Allied group not found",
      });
    }

    // Check if new program is already in another group
    const [existingMain] = await pool.execute(
      "SELECT id, group_id FROM allied_course_mapping WHERE program_id = ? AND group_id != ?",
      [parseInt(programId), parseInt(groupId)]
    );

    if (existingMain.length > 0) {
      return res.status(400).json({
        success: false,
        error: "This program is already part of another allied group",
      });
    }

    // If allied program is selected, check if it's in another group
    if (hasAlliedDepartment === "Yes" && alliedProgramId) {
      const [existingAllied] = await pool.execute(
        "SELECT id, group_id FROM allied_course_mapping WHERE program_id = ? AND group_id != ?",
        [parseInt(alliedProgramId), parseInt(groupId)]
      );

      if (existingAllied.length > 0) {
        return res.status(400).json({
          success: false,
          error: "The allied program is already part of another allied group",
        });
      }
    }

    // Start transaction
    await connection.beginTransaction();

    // Delete existing mappings for this group
    await connection.execute(
      "DELETE FROM allied_course_mapping WHERE group_id = ?",
      [parseInt(groupId)]
    );

    // Insert the main program
    await connection.execute(
      "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
      [parseInt(groupId), parseInt(programId)]
    );

    // If allied program is selected, insert it too
    if (hasAlliedDepartment === "Yes" && alliedProgramId) {
      await connection.execute(
        "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
        [parseInt(groupId), parseInt(alliedProgramId)]
      );
    }

    // Commit transaction
    await connection.commit();

    res.json({
      success: true,
      message: "Allied course mapping updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating allied mapping:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update allied mapping",
    });
  } finally {
    connection.release();
  }
};

/**
 * Delete Allied Course Group
 * Deletes an existing allied course group (cascade deletes mappings)
 */
const deleteAlliedMapping = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if the group exists
    const [existing] = await pool.execute(
      "SELECT id FROM allied_course_group WHERE id = ?",
      [parseInt(groupId)]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Allied group not found",
      });
    }

    // Delete the group (CASCADE will delete mappings)
    await pool.execute(
      "DELETE FROM allied_course_group WHERE id = ?",
      [parseInt(groupId)]
    );

    res.json({
      success: true,
      message: "Allied course group deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting allied group:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete allied group",
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
