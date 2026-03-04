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
      programAppliedFor,
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
          program_applied_for = ?,
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
          toStringOrNull(programAppliedFor),
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
          program_applied_for,
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          toStringOrNull(programAppliedFor),
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

module.exports = {
  getProgramNames,
  getInstituteProfile,
  saveInstituteProfile,
};
