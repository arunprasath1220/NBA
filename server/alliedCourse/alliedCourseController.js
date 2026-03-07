const pool = require("../db");

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

const validateProgramYear = async (connection, programId, academicYearStart) => {
  const [rows] = await connection.execute(
    `SELECT year_start as yearStart, year_end as yearEnd
     FROM all_program
     WHERE id = ?`,
    [programId],
  );

  if (rows.length === 0) {
    return { valid: false, reason: "Program not found" };
  }

  const yearStart = rows[0].yearStart ? Number(rows[0].yearStart) : null;
  const yearEnd = rows[0].yearEnd ? Number(rows[0].yearEnd) : null;

  if (yearStart !== null && academicYearStart < yearStart) {
    return {
      valid: false,
      reason: `Program is available from ${yearStart}`,
    };
  }

  if (yearEnd !== null && academicYearStart > yearEnd) {
    return {
      valid: false,
      reason: `Program is closed after ${yearEnd}`,
    };
  }

  return { valid: true };
};

const isProgramMappedInYear = async (
  connection,
  programId,
  academicYear,
  excludeGroupId = null,
) => {
  let query = `SELECT acm.id
               FROM allied_course_mapping acm
               INNER JOIN allied_course_group acg ON acm.group_id = acg.id
               WHERE acm.program_id = ? AND acg.academic_year = ?`;
  const params = [programId, academicYear];

  if (excludeGroupId !== null) {
    query += " AND acm.group_id != ?";
    params.push(excludeGroupId);
  }

  const [rows] = await connection.execute(query, params);
  return rows.length > 0;
};

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
    const parsedAcademicYear = req.query.academicYear
      ? parseAcademicYear(req.query.academicYear)
      : null;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level ID is required",
      });
    }

    if (req.query.academicYear && !parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic year format. Expected YYYY-YY",
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
        AND (? IS NULL OR (
          (ap.year_start IS NULL OR ap.year_start <= ?)
          AND (ap.year_end IS NULL OR ap.year_end >= ?)
        ))
      ORDER BY pn.coursename ASC`,
      [
        Number.parseInt(levelId, 10),
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
      ]
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
    const parsedAcademicYear = req.query.academicYear
      ? parseAcademicYear(req.query.academicYear)
      : null;

    if (req.query.academicYear && !parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic year format. Expected YYYY-YY",
      });
    }

    const [rows] = await pool.execute(
      `SELECT DISTINCT department_name as departmentName 
       FROM all_program 
       WHERE department_name IS NOT NULL AND department_name != ''
         AND (? IS NULL OR (
           (year_start IS NULL OR year_start <= ?)
           AND (year_end IS NULL OR year_end >= ?)
         ))
       ORDER BY department_name ASC`
      ,
      [
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
      ]
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
    const parsedAcademicYear = req.query.academicYear
      ? parseAcademicYear(req.query.academicYear)
      : null;

    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level ID is required",
      });
    }

    if (req.query.academicYear && !parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic year format. Expected YYYY-YY",
      });
    }

    const [rows] = await pool.execute(
      `SELECT DISTINCT department_name as departmentName 
       FROM all_program 
       WHERE level = ? AND department_name IS NOT NULL AND department_name != ''
         AND (? IS NULL OR (
           (year_start IS NULL OR year_start <= ?)
           AND (year_end IS NULL OR year_end >= ?)
         ))
       ORDER BY department_name ASC`,
      [
        Number.parseInt(levelId, 10),
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
      ]
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
    const parsedAcademicYear = req.query.academicYear
      ? parseAcademicYear(req.query.academicYear)
      : null;

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

    if (req.query.academicYear && !parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic year format. Expected YYYY-YY",
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
        AND (? IS NULL OR (
          (ap.year_start IS NULL OR ap.year_start <= ?)
          AND (ap.year_end IS NULL OR ap.year_end >= ?)
        ))
      ORDER BY pn.coursename ASC`,
      [
        Number.parseInt(levelId, 10),
        decodeURIComponent(departmentName),
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
        parsedAcademicYear ? parsedAcademicYear.startYear : null,
      ]
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
    const parsedAcademicYear = req.query.academicYear
      ? parseAcademicYear(req.query.academicYear)
      : null;

    if (req.query.academicYear && !parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Invalid academic year format. Expected YYYY-YY",
      });
    }

    // Get all groups with their programs
    const [groups] = await pool.execute(
      `SELECT 
        acg.id as groupId,
        acg.academic_year as academicYear,
        acg.created_at as createdAt
      FROM allied_course_group acg
      WHERE (? IS NULL OR acg.academic_year = ?)
      ORDER BY acg.id DESC`,
      [
        parsedAcademicYear ? parsedAcademicYear.label : null,
        parsedAcademicYear ? parsedAcademicYear.label : null,
      ]
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
          academicYear: group.academicYear,
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
      academicYear,
      alliedProgramIds // Now an array
    } = req.body;

    const parsedAcademicYear = parseAcademicYear(academicYear);

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
    if (!parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Valid academic year is required (YYYY-YY)",
      });
    }

    // If "Yes" is selected, validate allied programs
    if (hasAlliedDepartment === "Yes") {
      if (!alliedProgramIds || alliedProgramIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one allied program is required",
        });
      }
    }

    const mainProgramId = Number.parseInt(programId, 10);
    const yearValidation = await validateProgramYear(
      connection,
      mainProgramId,
      parsedAcademicYear.startYear,
    );
    if (!yearValidation.valid) {
      return res.status(400).json({
        success: false,
        error: `Main program is not valid for ${parsedAcademicYear.label}. ${yearValidation.reason}`,
      });
    }

    // Check if main program is already in a group for this academic year
    const mainMapped = await isProgramMappedInYear(
      connection,
      mainProgramId,
      parsedAcademicYear.label,
    );

    if (mainMapped) {
      return res.status(400).json({
        success: false,
        error: "This program is already part of an allied group for the selected academic year",
      });
    }

    // If allied programs are selected, check if any is already in a group
    if (hasAlliedDepartment === "Yes" && alliedProgramIds && alliedProgramIds.length > 0) {
      for (const alliedId of alliedProgramIds) {
        const alliedProgramId = Number.parseInt(alliedId, 10);
        const alliedYearValidation = await validateProgramYear(
          connection,
          alliedProgramId,
          parsedAcademicYear.startYear,
        );

        if (!alliedYearValidation.valid) {
          return res.status(400).json({
            success: false,
            error: `Allied program is not valid for ${parsedAcademicYear.label}. ${alliedYearValidation.reason}`,
          });
        }

        const alliedMapped = await isProgramMappedInYear(
          connection,
          alliedProgramId,
          parsedAcademicYear.label,
        );

        if (alliedMapped) {
          return res.status(400).json({
            success: false,
            error: "One of the allied programs is already part of another allied group for the selected academic year",
          });
        }
      }
    }

    // Start transaction
    await connection.beginTransaction();

    // Create a new allied course group
    const [groupResult] = await connection.execute(
      "INSERT INTO allied_course_group (academic_year) VALUES (?)",
      [parsedAcademicYear.label],
    );
    const groupId = groupResult.insertId;

    // Insert the main program into the mapping
    await connection.execute(
      "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
      [groupId, mainProgramId]
    );

    // If allied programs are selected, insert them all
    if (hasAlliedDepartment === "Yes" && alliedProgramIds && alliedProgramIds.length > 0) {
      for (const alliedId of alliedProgramIds) {
        await connection.execute(
          "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
          [groupId, Number.parseInt(alliedId, 10)]
        );
      }
    }

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Allied course mapping added successfully",
      data: {
        groupId: groupId,
        programId: mainProgramId,
        academicYear: parsedAcademicYear.label,
        alliedProgramIds: hasAlliedDepartment === "Yes" ? alliedProgramIds : [],
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
      academicYear,
      alliedProgramIds // Now an array
    } = req.body;

    const parsedAcademicYear = parseAcademicYear(academicYear);

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
    if (!parsedAcademicYear) {
      return res.status(400).json({
        success: false,
        error: "Valid academic year is required (YYYY-YY)",
      });
    }

    // If "Yes" is selected, validate allied programs
    if (hasAlliedDepartment === "Yes") {
      if (!alliedProgramIds || alliedProgramIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "At least one allied program is required",
        });
      }
    }

    // Check if the group exists
    const [existingGroup] = await pool.execute(
      "SELECT id FROM allied_course_group WHERE id = ?",
      [Number.parseInt(groupId, 10)]
    );

    if (existingGroup.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Allied group not found",
      });
    }

    const groupIdNum = Number.parseInt(groupId, 10);
    const mainProgramId = Number.parseInt(programId, 10);

    const yearValidation = await validateProgramYear(
      connection,
      mainProgramId,
      parsedAcademicYear.startYear,
    );
    if (!yearValidation.valid) {
      return res.status(400).json({
        success: false,
        error: `Main program is not valid for ${parsedAcademicYear.label}. ${yearValidation.reason}`,
      });
    }

    // Check if new program is already in another group for the selected year.
    const mainMapped = await isProgramMappedInYear(
      connection,
      mainProgramId,
      parsedAcademicYear.label,
      groupIdNum,
    );

    if (mainMapped) {
      return res.status(400).json({
        success: false,
        error: "This program is already part of another allied group for the selected academic year",
      });
    }

    // If allied programs are selected, check if any is in another group
    if (hasAlliedDepartment === "Yes" && alliedProgramIds && alliedProgramIds.length > 0) {
      for (const alliedId of alliedProgramIds) {
        const alliedProgramId = Number.parseInt(alliedId, 10);
        const alliedYearValidation = await validateProgramYear(
          connection,
          alliedProgramId,
          parsedAcademicYear.startYear,
        );

        if (!alliedYearValidation.valid) {
          return res.status(400).json({
            success: false,
            error: `Allied program is not valid for ${parsedAcademicYear.label}. ${alliedYearValidation.reason}`,
          });
        }

        const alliedMapped = await isProgramMappedInYear(
          connection,
          alliedProgramId,
          parsedAcademicYear.label,
          groupIdNum,
        );

        if (alliedMapped) {
          return res.status(400).json({
            success: false,
            error: "One of the allied programs is already part of another allied group for the selected academic year",
          });
        }
      }
    }

    // Start transaction
    await connection.beginTransaction();

    // Update academic year for this group snapshot.
    await connection.execute(
      "UPDATE allied_course_group SET academic_year = ? WHERE id = ?",
      [parsedAcademicYear.label, groupIdNum],
    );

    // Delete existing mappings for this group
    await connection.execute(
      "DELETE FROM allied_course_mapping WHERE group_id = ?",
      [groupIdNum]
    );

    // Insert the main program
    await connection.execute(
      "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
      [groupIdNum, mainProgramId]
    );

    // If allied programs are selected, insert them all
    if (hasAlliedDepartment === "Yes" && alliedProgramIds && alliedProgramIds.length > 0) {
      for (const alliedId of alliedProgramIds) {
        await connection.execute(
          "INSERT INTO allied_course_mapping (group_id, program_id) VALUES (?, ?)",
          [groupIdNum, Number.parseInt(alliedId, 10)]
        );
      }
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

/**
 * Import Allied Mapping Snapshot From One Year To Another
 * Clones all allied groups and mappings from sourceAcademicYear to targetAcademicYear.
 */
const importAlliedMappingsByYear = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      sourceAcademicYear,
      targetAcademicYear,
      overwrite = false,
    } = req.body;

    const parsedSourceYear = parseAcademicYear(sourceAcademicYear);
    const parsedTargetYear = parseAcademicYear(targetAcademicYear);

    if (!parsedSourceYear || !parsedTargetYear) {
      return res.status(400).json({
        success: false,
        error: "Valid sourceAcademicYear and targetAcademicYear are required (YYYY-YY)",
      });
    }

    if (parsedSourceYear.label === parsedTargetYear.label) {
      return res.status(400).json({
        success: false,
        error: "Source and target academic year cannot be the same",
      });
    }

    const [sourceGroups] = await connection.execute(
      `SELECT id as groupId
       FROM allied_course_group
       WHERE academic_year = ?
       ORDER BY id ASC`,
      [parsedSourceYear.label],
    );

    if (sourceGroups.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No mappings found for source year ${parsedSourceYear.label}`,
      });
    }

    const [existingTargetGroups] = await connection.execute(
      `SELECT id
       FROM allied_course_group
       WHERE academic_year = ?`,
      [parsedTargetYear.label],
    );

    if (existingTargetGroups.length > 0 && !overwrite) {
      return res.status(409).json({
        success: false,
        error: `Target year ${parsedTargetYear.label} already has mapping data`,
        existingGroupCount: existingTargetGroups.length,
      });
    }

    await connection.beginTransaction();

    if (existingTargetGroups.length > 0 && overwrite) {
      await connection.execute(
        `DELETE FROM allied_course_group
         WHERE academic_year = ?`,
        [parsedTargetYear.label],
      );
    }

    const importedProgramIds = new Set();
    let importedGroupCount = 0;
    let skippedGroupCount = 0;
    let skippedProgramCount = 0;
    const skippedPrograms = [];

    for (const sourceGroup of sourceGroups) {
      const [sourceMappings] = await connection.execute(
        `SELECT program_id as programId
         FROM allied_course_mapping
         WHERE group_id = ?
         ORDER BY id ASC`,
        [sourceGroup.groupId],
      );

      if (sourceMappings.length === 0) {
        continue;
      }

      // Keep original semantics: first mapping is main program.
      const mainProgramId = Number.parseInt(sourceMappings[0].programId, 10);
      const mainValidation = await validateProgramYear(
        connection,
        mainProgramId,
        parsedTargetYear.startYear,
      );

      if (!mainValidation.valid || importedProgramIds.has(mainProgramId)) {
        skippedGroupCount += 1;
        skippedProgramCount += sourceMappings.length;
        skippedPrograms.push({
          groupId: sourceGroup.groupId,
          programId: mainProgramId,
          reason: !mainValidation.valid
            ? mainValidation.reason
            : "Program already imported from another group",
          scope: "group-skipped-main-program",
        });
        continue;
      }

      const validProgramIds = [mainProgramId];

      // Allied programs can be partially imported; invalid ones are skipped.
      for (const mapping of sourceMappings.slice(1)) {
        const programId = Number.parseInt(mapping.programId, 10);

        const programValidation = await validateProgramYear(
          connection,
          programId,
          parsedTargetYear.startYear,
        );

        if (!programValidation.valid) {
          skippedProgramCount += 1;
          skippedPrograms.push({
            groupId: sourceGroup.groupId,
            programId,
            reason: programValidation.reason,
            scope: "allied-program-skipped",
          });
          continue;
        }

        if (importedProgramIds.has(programId) || validProgramIds.includes(programId)) {
          skippedProgramCount += 1;
          skippedPrograms.push({
            groupId: sourceGroup.groupId,
            programId,
            reason: "Program already imported from another group",
            scope: "allied-program-skipped",
          });
          continue;
        }

        validProgramIds.push(programId);
      }

      const [newGroupResult] = await connection.execute(
        `INSERT INTO allied_course_group (academic_year)
         VALUES (?)`,
        [parsedTargetYear.label],
      );

      const newGroupId = newGroupResult.insertId;

      for (const programId of validProgramIds) {
        importedProgramIds.add(programId);

        await connection.execute(
          `INSERT INTO allied_course_mapping (group_id, program_id)
           VALUES (?, ?)`,
          [newGroupId, programId],
        );
      }

      importedGroupCount += 1;
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Imported ${importedGroupCount} allied mapping groups from ${parsedSourceYear.label} to ${parsedTargetYear.label}`,
      data: {
        sourceAcademicYear: parsedSourceYear.label,
        targetAcademicYear: parsedTargetYear.label,
        importedGroupCount,
        skippedGroupCount,
        skippedProgramCount,
        skippedPrograms,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error importing allied mapping by year:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to import allied mappings",
    });
  } finally {
    connection.release();
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
  importAlliedMappingsByYear,
};
