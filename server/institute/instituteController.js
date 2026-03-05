const pool = require("../db");

/**
 * Get Program Names
 * Returns all program names from the program_name table
 */
const getProgramNames = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, coursename FROM program_name ORDER BY coursename ASC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching program names:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch program names",
    });
  }
};

/**
 * Get Program Details (Level and Discipline)
 * Returns level and discipline for a given program ID from programname_level_discipline table
 * Joins with program_level and discipline tables to get actual names
 */
const getProgramDetails = async (req, res) => {
  try {
    const { programId } = req.params;
    
    const [rows] = await pool.query(
      `SELECT 
        pl.level as level, 
        d.discipline as discipline 
      FROM programname_level_discipline pld
      LEFT JOIN program_level pl ON pld.level = pl.id
      LEFT JOIN discipline d ON pld.discipline = d.id
      WHERE pld.name = ?`,
      [programId]
    );

    console.log("Program details for ID", programId, ":", rows);

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: { level: "", discipline: "" },
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching program details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch program details",
    });
  }
};

/**
 * Get Institute Profile
 * Returns the institute profile data (single record)
 * Accessible by both admin and user
 */
const getInstituteProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM institute_program_details ORDER BY id DESC LIMIT 1"
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "No institute profile found",
      });
    }

    // Map database columns to frontend field names
    const profile = rows[0];
    const mappedData = {
      id: profile.id,
      programAppliedFor: profile.program_applied_for || "",
      tire: profile.tier || "",
      instituteName: profile.institute_name || "",
      yearOfEstablishment: profile.year_of_establishment || "",
      location: profile.institute_location || "",
      address: profile.institute_address || "",
      city: profile.city || "",
      state: profile.state || "",
      pinCode: profile.pin_code || "",
      website: profile.website || "",
      email: profile.institute_email || "",
      phoneNo: profile.institute_phone || "",
      institutionType: profile.institute_type || "",
      ownershipStatus: profile.ownership_status || "",
      headName: profile.head_name || "",
      headDesignation: profile.head_designation || "",
      appointmentStatus: profile.appointment_status || "",
      headMobileNo: profile.head_mobile || "",
      headEmail: profile.head_email || "",
      headTelephoneNo: profile.head_telephone || "",
      universityName: profile.university_name || "",
      universityCity: profile.university_city || "",
      universityState: profile.university_state || "",
      universityPinCode: profile.university_pin_code || "",
      programName: profile.program_name || "",
      discipline: profile.discipline || "",
      level: profile.level || "",
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    res.json({
      success: true,
      data: mappedData,
    });
  } catch (error) {
    console.error("Error fetching institute profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch institute profile",
    });
  }
};

/**
 * Create or Update Institute Profile
 * Only accessible by admin
 */
const saveInstituteProfile = async (req, res) => {
  try {
    const {
      tire,
      instituteName,
      yearOfEstablishment,
      location,
      address,
      city,
      state,
      pinCode,
      website,
      email,
      phoneNo,
      institutionType,
      ownershipStatus,
      headName,
      headDesignation,
      appointmentStatus,
      headMobileNo,
      headEmail,
      headTelephoneNo,
      universityName,
      universityCity,
      universityState,
      universityPinCode,
    } = req.body;

    // Helper to convert empty strings to null (for INT columns)
    const toIntOrNull = (val) => {
      if (val === "" || val === null || val === undefined) return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    };

    // Helper to convert empty strings to null (for string columns)
    const toStringOrNull = (val) => {
      if (val === "" || val === null || val === undefined) return null;
      return val;
    };

    // Validate required fields
    if (!instituteName) {
      return res.status(400).json({
        success: false,
        error: "Institute name is required",
      });
    }

    // Check if a profile already exists
    const [existing] = await pool.execute(
      "SELECT id FROM institute_program_details LIMIT 1"
    );

    if (existing.length > 0) {
      // Update existing profile
      const [result] = await pool.execute(
        `UPDATE institute_program_details SET
          tier = ?,
          institute_name = ?,
          year_of_establishment = ?,
          institute_location = ?,
          institute_address = ?,
          city = ?,
          state = ?,
          pin_code = ?,
          website = ?,
          institute_email = ?,
          institute_phone = ?,
          institute_type = ?,
          ownership_status = ?,
          head_name = ?,
          head_designation = ?,
          appointment_status = ?,
          head_mobile = ?,
          head_email = ?,
          head_telephone = ?,
          university_name = ?,
          university_city = ?,
          university_state = ?,
          university_pin_code = ?
        WHERE id = ?`,
        [
          toStringOrNull(tire),
          instituteName,
          toIntOrNull(yearOfEstablishment),
          toStringOrNull(location),
          toStringOrNull(address),
          toStringOrNull(city),
          toStringOrNull(state),
          toStringOrNull(pinCode),
          toStringOrNull(website),
          toStringOrNull(email),
          toStringOrNull(phoneNo),
          toStringOrNull(institutionType),
          toStringOrNull(ownershipStatus),
          toStringOrNull(headName),
          toStringOrNull(headDesignation),
          toStringOrNull(appointmentStatus),
          toStringOrNull(headMobileNo),
          toStringOrNull(headEmail),
          toStringOrNull(headTelephoneNo),
          toStringOrNull(universityName),
          toStringOrNull(universityCity),
          toStringOrNull(universityState),
          toStringOrNull(universityPinCode),
          existing[0].id,
        ]
      );

      res.json({
        success: true,
        message: "Institute profile updated successfully",
        id: existing[0].id,
      });
    } else {
      // Create new profile
      const [result] = await pool.execute(
        `INSERT INTO institute_program_details (
          tier,
          institute_name,
          year_of_establishment,
          institute_location,
          institute_address,
          city,
          state,
          pin_code,
          website,
          institute_email,
          institute_phone,
          institute_type,
          ownership_status,
          head_name,
          head_designation,
          appointment_status,
          head_mobile,
          head_email,
          head_telephone,
          university_name,
          university_city,
          university_state,
          university_pin_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          toStringOrNull(tire),
          instituteName,
          toIntOrNull(yearOfEstablishment),
          toStringOrNull(location),
          toStringOrNull(address),
          toStringOrNull(city),
          toStringOrNull(state),
          toStringOrNull(pinCode),
          toStringOrNull(website),
          toStringOrNull(email),
          toStringOrNull(phoneNo),
          toStringOrNull(institutionType),
          toStringOrNull(ownershipStatus),
          toStringOrNull(headName),
          toStringOrNull(headDesignation),
          toStringOrNull(appointmentStatus),
          toStringOrNull(headMobileNo),
          toStringOrNull(headEmail),
          toStringOrNull(headTelephoneNo),
          toStringOrNull(universityName),
          toStringOrNull(universityCity),
          toStringOrNull(universityState),
          toStringOrNull(universityPinCode),
        ]
      );

      res.status(201).json({
        success: true,
        message: "Institute profile created successfully",
        id: result.insertId,
      });
    }
  } catch (error) {
    console.error("Error saving institute profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to save institute profile",
    });
  }
};

/**
 * Get Disciplines
 * Returns all disciplines from the discipline table
 */
const getDisciplines = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, discipline FROM discipline ORDER BY discipline ASC"
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching disciplines:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch disciplines",
    });
  }
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
 * Add Program Name
 * Adds a new program name to the program_name table
 */
const addProgramName = async (req, res) => {
  try {
    const { coursename } = req.body;

    if (!coursename || coursename.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Course name is required",
      });
    }

    const [result] = await pool.execute(
      "INSERT INTO program_name (coursename) VALUES (?)",
      [coursename.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Program name added successfully",
      data: {
        id: result.insertId,
        coursename: coursename.trim(),
      },
    });
  } catch (error) {
    console.error("Error adding program name:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add program name",
    });
  }
};

/**
 * Add Course
 * Adds a new course to all_program table
 * First inserts program name into program_name table, then uses that ID as foreign key
 */
const addCourse = async (req, res) => {
  try {
    const { disciplineId, levelId, programName, departmentName, yearOfStart } = req.body;

    // Validate required fields
    if (!disciplineId) {
      return res.status(400).json({
        success: false,
        error: "Discipline is required",
      });
    }
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level of program is required",
      });
    }
    if (!programName || programName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Program name is required",
      });
    }
    if (!departmentName || departmentName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }
    if (!yearOfStart) {
      return res.status(400).json({
        success: false,
        error: "Year of start is required",
      });
    }

    // Step 1: Insert program name into program_name table
    const [programResult] = await pool.execute(
      "INSERT INTO program_name (coursename) VALUES (?)",
      [programName.trim()]
    );
    const programNameId = programResult.insertId;

    // Step 2: Insert into programname_level_discipline table
    await pool.execute(
      `INSERT INTO programname_level_discipline (name, level, discipline) 
       VALUES (?, ?, ?)`,
      [
        programNameId,
        parseInt(levelId),
        parseInt(disciplineId),
      ]
    );

    // Step 3: Insert into all_program table with foreign keys
    const [courseResult] = await pool.execute(
      `INSERT INTO all_program (discipline, level, programname, department_name, year_start) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        parseInt(disciplineId),
        parseInt(levelId),
        programNameId,
        departmentName.trim(),
        parseInt(yearOfStart),
      ]
    );

    res.status(201).json({
      success: true,
      message: "Course added successfully",
      data: {
        id: courseResult.insertId,
        programNameId: programNameId,
        disciplineId: parseInt(disciplineId),
        levelId: parseInt(levelId),
        departmentName: departmentName.trim(),
        yearOfStart: parseInt(yearOfStart),
      },
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add course",
    });
  }
};

/**
 * Get All Courses
 * Returns all courses from all_program table with joined data
 */
const getAllCourses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        ap.id,
        ap.discipline as disciplineId,
        ap.level as levelId,
        ap.programname as programNameId,
        d.discipline as discipline,
        pl.level as level,
        pn.coursename as programName,
        ap.department_name as departmentName,
        ap.year_start as yearStart,
        ap.year_end as yearEnd
      FROM all_program ap
      LEFT JOIN discipline d ON ap.discipline = d.id
      LEFT JOIN program_level pl ON ap.level = pl.id
      LEFT JOIN program_name pn ON ap.programname = pn.id
      ORDER BY ap.id ASC`
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
    });
  }
};

/**
 * Update Course
 * Updates an existing course in all_program table
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { disciplineId, levelId, programName, departmentName, yearOfStart, yearOfEnd } = req.body;

    // Validate required fields
    if (!disciplineId) {
      return res.status(400).json({
        success: false,
        error: "Discipline is required",
      });
    }
    if (!levelId) {
      return res.status(400).json({
        success: false,
        error: "Level of program is required",
      });
    }
    if (!programName || programName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Program name is required",
      });
    }
    if (!departmentName || departmentName.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Department name is required",
      });
    }
    if (!yearOfStart) {
      return res.status(400).json({
        success: false,
        error: "Year of start is required",
      });
    }

    // Get the existing course to find the programname ID
    const [existingCourse] = await pool.execute(
      "SELECT programname FROM all_program WHERE id = ?",
      [id]
    );

    if (existingCourse.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const programNameId = existingCourse[0].programname;

    // Update the program name in program_name table
    await pool.execute(
      "UPDATE program_name SET coursename = ? WHERE id = ?",
      [programName.trim(), programNameId]
    );

    // Update the all_program table
    await pool.execute(
      `UPDATE all_program 
       SET discipline = ?, level = ?, department_name = ?, year_start = ?, year_end = ?
       WHERE id = ?`,
      [
        parseInt(disciplineId),
        parseInt(levelId),
        departmentName.trim(),
        parseInt(yearOfStart),
        yearOfEnd ? parseInt(yearOfEnd) : null,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update course",
    });
  }
};

module.exports = {
  getProgramNames,
  getProgramDetails,
  getInstituteProfile,
  saveInstituteProfile,
  getDisciplines,
  getProgramLevels,
  addProgramName,
  addCourse,
  getAllCourses,
  updateCourse,
};
