import React, { useRef, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import useFilterStore from "../store/filterStore";
import { useEffect } from "react";

const FACULTY_TEMPLATE_HEADERS = [
  "department_name",
  "program_name",
  "faculty_name",
  "pan_no",
  "apaar_faculty_id",
  "highest_degree",
  "university_name",
  "area_of_specialization",
  "date_of_joining",
  "designation_at_joining",
  "present_designation",
  "date_designated_as_prof",
  "date_of_receiving_highest_degree",
  "nature_of_association",
  "working_presently",
  "date_of_leaving",
  "experience_years",
  "is_hod_principal",
];

const FACULTY_TEMPLATE_SAMPLE = {
  department_name: "Computer Science and Engineering",
  program_name: "Computer Science and Engineering",
  faculty_name: "Dr. Example Faculty",
  pan_no: "ABCDE1234F",
  apaar_faculty_id: "APAAR123456",
  highest_degree: "Ph.D",
  university_name: "Anna University",
  area_of_specialization: "Machine Learning",
  date_of_joining: "2018-06-15",
  designation_at_joining: "Assistant Professor",
  present_designation: "Associate Professor",
  date_designated_as_prof: "2023-07-01",
  date_of_receiving_highest_degree: "2017-05-30",
  nature_of_association: "Regular",
  working_presently: "Yes",
  date_of_leaving: "",
  experience_years: "8",
  is_hod_principal: "No",
};

const normalizeHeaderKey = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const designationRowOrder = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Number of Ph.D",
];

const FacultyByDepartment = ({ programId }) => {
  // Get current user / admin helper from the auth store
  const { isAdmin } = useAuthStore();

  const [formData, setFormData] = useState({
    program_id: programId || "",
    faculty_name: "",
    pan_no: "",
    apaar_faculty_id: "",
    highest_degree: "",
    university_name: "",
    area_of_specialization: "",
    date_of_joining: "",
    designation_at_joining: "",
    present_designation: "",
    date_designated_as_prof: "",
    date_of_receiving_highest_degree: "",
    working_presently: "",
    is_hod_principal: "No",
    experience_years: ""
  });

  const [facultyList, setFacultyList] = useState([]);
  const [designationStats, setDesignationStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const bulkFileInputRef = useRef(null);

  // Control showing the add form (hidden by default)
  const [showForm, setShowForm] = useState(false);

  const { selectedProgramId, programs, selectedAcademicYear } = useFilterStore();

  // Pre-fill program_id from global top-bar selection when available
  useEffect(() => {
    if (selectedProgramId) {
      setFormData((prev) => ({ ...prev, program_id: selectedProgramId }));
    }
  }, [selectedProgramId]);

  // Fetch faculty list whenever program selection changes or on mount
  useEffect(() => {
    fetchFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  useEffect(() => {
    fetchDesignationStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId, selectedAcademicYear]);

  const fetchFaculty = async () => {
    try {
      const resp = await axios.get("http://localhost:5000/api/faculty", {
        params: selectedProgramId ? { program_id: selectedProgramId } : {},
        withCredentials: true,
      });
      if (resp.data && resp.data.success) {
        setFacultyList(resp.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  const fetchDesignationStats = async () => {
    if (!selectedProgramId || !selectedAcademicYear) {
      setDesignationStats(null);
      setStatsError("");
      return;
    }

    try {
      setIsStatsLoading(true);
      setStatsError("");

      const resp = await axios.get("http://localhost:5000/api/faculty/stats/designation", {
        params: {
          program_id: selectedProgramId,
          academicYear: selectedAcademicYear,
        },
        withCredentials: true,
      });

      if (resp.data?.success) {
        setDesignationStats(resp.data.data || null);
      } else {
        setDesignationStats(null);
      }
    } catch (err) {
      console.error("Error fetching designation stats:", err);
      setDesignationStats(null);
      setStatsError(err?.response?.data?.error || "Failed to load designation summary");
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Filter programs by selectedAcademicYear (same logic used elsewhere)
  const filteredPrograms = programs && programs.length > 0
    ? (selectedAcademicYear ? programs.filter((program) => {
        const selectedStartYear = parseInt(selectedAcademicYear.split("-")[0]);
        if (!program.yearEnd) return true;
        const yearEnd = parseInt(program.yearEnd);
        const minYear = selectedStartYear - 2;
        return yearEnd >= minYear && yearEnd <= selectedStartYear;
      }) : programs)
    : [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        // prefer program id from the form, fall back to prop
        program_id: formData.program_id || programId,
        ...formData
      };

      if (editMode && editId) {
        await axios.put(`http://localhost:5000/api/faculty/${editId}`, payload, { withCredentials: true });
        alert("Faculty updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/faculty/add", payload, { withCredentials: true });
        alert("Faculty added successfully");
      }

      // Refresh list
      fetchFaculty();

      setFormData({
        program_id: programId || "",
        faculty_name: "",
        pan_no: "",
        apaar_faculty_id: "",
        highest_degree: "",
        university_name: "",
        area_of_specialization: "",
        date_of_joining: "",
        designation_at_joining: "",
        present_designation: "",
        date_designated_as_prof: "",
        date_of_receiving_highest_degree: "",
        working_presently: "",
        is_hod_principal: "No",
        experience_years: ""

      });

      // reset edit state
      setEditMode(false);
      setEditId(null);

    } catch (error) {
      console.error(error);
      alert("Error saving faculty: " + (error?.response?.data?.error || error.message));
    }
  };

  const handleEdit = (row) => {
    // Row contains program_id (pld.id) and program_name_id (program_name.id) from server
    setFormData({
      program_id: row.program_name_id ? String(row.program_name_id) : String(row.program_id || ""),
      faculty_name: row.faculty_name || "",
      pan_no: row.pan_no || "",
      apaar_faculty_id: row.apaar_faculty_id || "",
      highest_degree: row.highest_degree || "",
      university_name: row.university_name || "",
      area_of_specialization: row.area_of_specialization || "",
      date_of_joining: row.date_of_joining ? row.date_of_joining.split("T")[0] : "",
      designation_at_joining: row.designation_at_joining || "",
      present_designation: row.present_designation || "",
      date_designated_as_prof: row.date_designated_as_prof ? row.date_designated_as_prof.split("T")[0] : "",
      date_of_receiving_highest_degree: row.date_of_receiving_highest_degree ? row.date_of_receiving_highest_degree.split("T")[0] : "",
      working_presently: row.working_presently || "",
      nature_of_association: row.nature_of_association || "Regular",
      date_of_leaving: row.date_of_leaving ? row.date_of_leaving.split("T")[0] : "",
      experience_years: row.experience_years || "",
      is_hod_principal: row.is_hod_principal || "No",
    });
    setEditMode(true);
    setEditId(row.id);
    setShowForm(true);
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([FACULTY_TEMPLATE_SAMPLE], {
      header: FACULTY_TEMPLATE_HEADERS,
    });
    worksheet["!cols"] = [
      { wch: 28 },
      { wch: 34 },
      { wch: 28 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 24 },
      { wch: 30 },
      { wch: 22 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Template");
    XLSX.writeFile(workbook, "Faculty_Bulk_Import_Template.xlsx");
  };

  const parseBulkRows = (worksheet) => {
    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });

    if (!rawRows.length) {
      return { rows: [], missingHeaders: FACULTY_TEMPLATE_HEADERS };
    }

    const firstRowHeaders = Object.keys(rawRows[0]).map(normalizeHeaderKey);
    const missingHeaders = FACULTY_TEMPLATE_HEADERS.filter(
      (requiredHeader) => !firstRowHeaders.includes(requiredHeader)
    );

    const parsedRows = rawRows
      .map((row, index) => {
        const normalizedRow = {};
        Object.entries(row).forEach(([key, value]) => {
          normalizedRow[normalizeHeaderKey(key)] = String(value ?? "").trim();
        });

        const hasAnyValue = FACULTY_TEMPLATE_HEADERS.some(
          (header) => normalizedRow[header]
        );

        if (!hasAnyValue) return null;

        return {
          ...normalizedRow,
          row_number: index + 2,
        };
      })
      .filter(Boolean);

    return { rows: parsedRows, missingHeaders };
  };

  const handleBulkImport = async () => {
    if (!bulkFile) {
      alert("Please select an Excel file first.");
      return;
    }

    try {
      setIsImporting(true);
      setImportResult(null);

      const fileBuffer = await bulkFile.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        alert("The uploaded file does not contain any worksheet.");
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const { rows, missingHeaders } = parseBulkRows(worksheet);

      if (missingHeaders.length > 0) {
        alert(`Template headers are missing: ${missingHeaders.join(", ")}`);
        return;
      }

      if (rows.length === 0) {
        alert("No data rows found in the Excel file.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/faculty/bulk-add",
        { rows },
        { withCredentials: true }
      );

      if (response.data?.success) {
        setImportResult(response.data);
        await fetchFaculty();
      }
    } catch (error) {
      console.error("Bulk import failed:", error);
      alert(
        "Bulk import failed: " +
          (error?.response?.data?.error || error.message || "Unknown error")
      );
    } finally {
      setIsImporting(false);
      setBulkFile(null);
      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
      }
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (facultyList.length === 0) {
      alert("No faculty data to export.");
      return;
    }

    const exportData = facultyList.map((row, index) => ({
      "S.No": index + 1,
      "Faculty Name": row.faculty_name || "-",
      "PAN No": row.pan_no || "-",
      "APAAR ID": row.apaar_faculty_id || "-",
      "Highest Degree": row.highest_degree || "-",
      "University": row.university_name || "-",
      "Specialization": row.area_of_specialization || "-",
      "Date of Joining": row.date_of_joining ? new Date(row.date_of_joining).toLocaleDateString('en-GB') : "-",
      "Designation at Joining": row.designation_at_joining || "-",
      "Present Designation": row.present_designation || "-",
      "Date as Professor": row.date_designated_as_prof ? new Date(row.date_designated_as_prof).toLocaleDateString('en-GB') : "-",
      "Date of Highest Degree": row.date_of_receiving_highest_degree ? new Date(row.date_of_receiving_highest_degree).toLocaleDateString('en-GB') : "-",
      "Nature of Association": row.nature_of_association || "-",
      "Working Currently": row.working_presently || "-",
      "Date of Leaving": row.date_of_leaving ? new Date(row.date_of_leaving).toLocaleDateString('en-GB') : "-",
      "Experience (Years)": row.experience_years || "-",
      "Is HoD/Principal": row.is_hod_principal || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faculty Details");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 16 },
      { wch: 20 },
      { wch: 18 },
      { wch: 24 },
      { wch: 24 },
      { wch: 16 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, "Faculty_Details.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    if (facultyList.length === 0) {
      alert("No faculty data to export.");
      return;
    }

    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("Faculty Details", 14, 15);

    const tableHeaders = [
      "S.No",
      "Faculty Name",
      "PAN No",
      "APAAR ID",
      "Highest Degree",
      "University",
      "Specialization",
      "Date of Joining",
      "Designation at Joining",
      "Present Designation",
      "Date as Prof",
      "Date of Degree",
      "Association",
      "Currently Working",
      "Date of Leaving",
      "Experience",
      "HoD/Principal"
    ];

    const tableData = facultyList.map((row, index) => [
      String(index + 1),
      row.faculty_name || "-",
      row.pan_no || "-",
      row.apaar_faculty_id || "-",
      row.highest_degree || "-",
      row.university_name || "-",
      row.area_of_specialization || "-",
      row.date_of_joining ? new Date(row.date_of_joining).toLocaleDateString('en-GB') : "-",
      row.designation_at_joining || "-",
      row.present_designation || "-",
      row.date_designated_as_prof ? new Date(row.date_designated_as_prof).toLocaleDateString('en-GB') : "-",
      row.date_of_receiving_highest_degree ? new Date(row.date_of_receiving_highest_degree).toLocaleDateString('en-GB') : "-",
      row.nature_of_association || "-",
      row.working_presently || "-",
      row.date_of_leaving ? new Date(row.date_of_leaving).toLocaleDateString('en-GB') : "-",
      row.experience_years || "-",
      row.is_hod_principal || "-",
    ]);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      theme: "grid",
    });

    doc.save("Faculty_Details.pdf");
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navbar />
      <TopBar />
      <main className="flex-1 min-w-0 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14 max-w-full">
          <div className="w-full max-w-full">
            {/* Academic Year Display */}
            <div className="mb-2 text-sm text-gray-600">
              Academic Year: <span className="font-semibold text-gray-800">{selectedAcademicYear || "Not selected"}</span>
            </div>

            {/* Admin-only form */}
            {isAdmin() && showForm && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">

                {/* Bulk Upload Section at the top of the form */}
                <div className="col-span-full p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">Bulk Import Faculty</h3>
                  <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="px-3 py-2 rounded-md bg-white border border-blue-300 text-sm font-medium text-blue-700 hover:bg-blue-100"
                    >
                      Download Excel Template
                    </button>

                    <input
                      ref={bulkFileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setBulkFile(file);
                        setImportResult(null);
                      }}
                      className="text-sm text-gray-700"
                    />

                    <button
                      type="button"
                      onClick={handleBulkImport}
                      disabled={!bulkFile || isImporting}
                      className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? "Importing..." : "Import Faculty"}
                    </button>
                  </div>

                  <p className="text-xs text-blue-800 mt-2">
                    Use the downloaded template and keep headers unchanged. Required fields per row: <span className="font-semibold">department_name, program_name, faculty_name</span>.
                  </p>

                  {importResult?.summary && (
                    <div className="mt-3 text-xs text-gray-700 bg-white border border-blue-200 rounded-md p-3">
                      <p className="font-semibold text-blue-900 mb-1">Import Summary:</p>
                      <p>Total rows: {importResult.summary.total || 0}</p>
                      <p className="text-green-700">Successful: {importResult.summary.success || 0}</p>
                      {importResult.summary.failed > 0 && (
                        <p className="text-red-700">Failed: {importResult.summary.failed || 0}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="col-span-full border-t border-gray-300 my-2"></div>

                <h3 className="col-span-full text-sm font-semibold text-gray-800">Add Individual Faculty</h3>

        {/* Program (select) */}
        <div className="flex flex-col">
          <label htmlFor="program_id" className="text-sm font-medium text-gray-700">Program</label>
          <select
            id="program_id"
            name="program_id"
            value={formData.program_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Program</option>
            {filteredPrograms.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.coursename || p.programname || p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="faculty_name" className="text-sm font-medium text-gray-700">Faculty Name</label>
          <input
            id="faculty_name"
            type="text"
            name="faculty_name"
            placeholder="Name of the Faculty"
            value={formData.faculty_name}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* PAN */}
        <div className="flex flex-col">
          <label htmlFor="pan_no" className="text-sm font-medium text-gray-700">PAN No</label>
          <input
            id="pan_no"
            type="text"
            name="pan_no"
            placeholder="PAN No"
            value={formData.pan_no}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* APAAR */}
        <div className="flex flex-col">
          <label htmlFor="apaar_faculty_id" className="text-sm font-medium text-gray-700">APAAR Faculty ID</label>
          <input
            id="apaar_faculty_id"
            type="text"
            name="apaar_faculty_id"
            placeholder="APAAR Faculty ID"
            value={formData.apaar_faculty_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Highest Degree */}
        <div className="flex flex-col">
          <label htmlFor="highest_degree" className="text-sm font-medium text-gray-700">Highest Degree</label>
          <select
            id="highest_degree"
            name="highest_degree"
            value={formData.highest_degree}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Highest Degree</option>
            <option>M.E</option>
            <option>M.Tech</option>
            <option>Ph.D</option>
            <option>M.E and Ph.D</option>
          </select>
        </div>

        {/* University */}
        <div className="flex flex-col">
          <label htmlFor="university_name" className="text-sm font-medium text-gray-700">University</label>
          <input
            id="university_name"
            type="text"
            name="university_name"
            placeholder="University Name"
            value={formData.university_name}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Specialization */}
        <div className="flex flex-col">
          <label htmlFor="area_of_specialization" className="text-sm font-medium text-gray-700">Area of Specialization</label>
          <input
            id="area_of_specialization"
            type="text"
            name="area_of_specialization"
            placeholder="Area of Specialization"
            value={formData.area_of_specialization}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Date of Joining */}
        <div className="flex flex-col">
          <label htmlFor="date_of_joining" className="text-sm font-medium text-gray-700">Date of Joining</label>
          <input
            id="date_of_joining"
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Designation at Joining */}
        <div className="flex flex-col">
          <label htmlFor="designation_at_joining" className="text-sm font-medium text-gray-700">Designation at Joining</label>
          <select
            id="designation_at_joining"
            name="designation_at_joining"
            value={formData.designation_at_joining}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Designation at Joining</option>
            <option>Lecturer</option>
            <option>Assistant Professor</option>
            <option>Associate Professor</option>
            <option>Professor</option>
          </select>
        </div>

        {/* Present Designation */}
        <div className="flex flex-col">
          <label htmlFor="present_designation" className="text-sm font-medium text-gray-700">Present Designation</label>
          <select
            id="present_designation"
            name="present_designation"
            value={formData.present_designation}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Present Designation</option>
            <option>Assistant Professor</option>
            <option>Associate Professor</option>
            <option>Professor</option>
          </select>
        </div>

        {/* Date designated as Professor */}
        <div className="flex flex-col">
          <label htmlFor="date_designated_as_prof" className="text-sm font-medium text-gray-700">Date Designated as Professor</label>
          <input
            id="date_designated_as_prof"
            type="date"
            name="date_designated_as_prof"
            value={formData.date_designated_as_prof}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Date receiving degree */}
        <div className="flex flex-col">
          <label htmlFor="date_of_receiving_highest_degree" className="text-sm font-medium text-gray-700">Date of Receiving Highest Degree</label>
          <input
            id="date_of_receiving_highest_degree"
            type="date"
            name="date_of_receiving_highest_degree"
            value={formData.date_of_receiving_highest_degree}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Working currently */}
        <div className="flex flex-col">
          <label htmlFor="working_presently" className="text-sm font-medium text-gray-700">Working Currently?</label>
          <select
            id="working_presently"
            name="working_presently"
            value={formData.working_presently}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Working Currently?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Nature of association */}
        <div className="flex flex-col">
          <label htmlFor="nature_of_association" className="text-sm font-medium text-gray-700">Nature of Association</label>
          <select
            id="nature_of_association"
            name="nature_of_association"
            value={formData.nature_of_association || 'Regular'}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="Regular">Regular</option>
            <option value="Contract">Contract</option>
            <option value="Visiting">Visiting</option>
          </select>
        </div>

        {/* Date of leaving (if applicable) */}
        <div className="flex flex-col">
          <label htmlFor="date_of_leaving" className="text-sm font-medium text-gray-700">Date of Leaving</label>
          <input
            id="date_of_leaving"
            type="date"
            name="date_of_leaving"
            value={formData.date_of_leaving || ""}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>


        {/* HoD */}
        <div className="flex flex-col">
          <label htmlFor="is_hod_principal" className="text-sm font-medium text-gray-700">Is HoD / Principal?</label>
          <select
            id="is_hod_principal"
            name="is_hod_principal"
            value={formData.is_hod_principal}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Experience */}
        <div className="flex flex-col">
          <label htmlFor="experience_years" className="text-sm font-medium text-gray-700">Experience (Years)</label>
          <input
            id="experience_years"
            type="number"
            step="0.1"
            name="experience_years"
            placeholder="Experience (Years)"
            value={formData.experience_years}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
        >
          {editMode ? "Update Faculty" : "Add Faculty"}
        </button>

      </form>
            )}

            {/* Faculty list - visible to both admin and user */}
            <div className="w-full">
              <div className="flex justify-between items-center py-2 mb-2">
                <h3 className="text-base font-semibold text-gray-800">Faculty List</h3>
                <div className="flex items-center gap-4">
                  {facultyList.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={exportToExcel}
                        className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel
                      </button>
                      <button
                        type="button"
                        onClick={exportToPDF}
                        className="text-red-600 hover:text-red-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF
                      </button>
                    </>
                  )}
                  {/* Add Faculty Button - Only for admin */}
                  {isAdmin() && (
                    <button
                      type="button"
                      onClick={() => setShowForm((s) => !s)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                      aria-expanded={showForm}
                    >
                      {showForm ? "Close" : "Add Faculty"}
                    </button>
                  )}
                </div>
              </div>
              {facultyList.length === 0 ? (
                <div className="text-sm text-gray-500">No faculty records found.</div>
                    ) : (
                      <>
                        <div className="md:hidden space-y-3">
                          {facultyList.map((row, index) => (
                            <div key={row.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-800 break-words">{row.faculty_name || "-"}</p>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                                <p><span className="font-medium">Designation:</span> {row.present_designation || "-"}</p>
                                <p><span className="font-medium">Degree:</span> {row.highest_degree || "-"}</p>
                                <p><span className="font-medium">Working:</span> {row.working_presently || "-"}</p>
                                <p><span className="font-medium">Experience:</span> {row.experience_years || "-"}</p>
                              </div>
                              {isAdmin() && (
                                <div className="mt-3 pt-2 border-t border-gray-100 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleEdit(row)}
                                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-[1600px] text-left text-[11px] sm:text-xs border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">S.No</th>
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Name of the Faculty</th>
                              <th className="hidden xl:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">PAN No.</th>
                              <th className="hidden xl:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">APAAR / AADHAAR Linked Faculty ID</th>
                              <th className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Highest Degree</th>
                              <th className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">University Name</th>
                              <th className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Area of Specialization</th>
                              <th className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Date of Joining</th>
                              <th className="hidden xl:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Designation at Joining</th>
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Present Designation</th>
                              <th className="hidden xl:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Date designated as Prof</th>
                              <th className="hidden lg:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Date of Receiving highest degree</th>
                              <th className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Nature of Association</th>
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Working Currently</th>
                              <th className="hidden xl:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Date of Leaving</th>
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Experience (in years)</th>
                              <th className="hidden md:table-cell px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Is HoD / Principal</th>
                              <th className="px-2 sm:px-3 py-2 sm:py-3 border border-gray-300 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {facultyList.map((row, index) => (
                              <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-2 sm:px-3 py-2 border border-gray-300 text-center">{index + 1}</td>
                                <td className="px-2 sm:px-3 py-2 border border-gray-300 whitespace-nowrap">{row.faculty_name || '-'}</td>
                                <td className="hidden xl:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.pan_no || '-'}</td>
                                <td className="hidden xl:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.apaar_faculty_id || '-'}</td>
                                <td className="hidden md:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.highest_degree || '-'}</td>
                                <td className="hidden lg:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.university_name || '-'}</td>
                                <td className="hidden lg:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.area_of_specialization || '-'}</td>
                                <td className="hidden lg:table-cell px-2 sm:px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_joining ? new Date(row.date_of_joining).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="hidden xl:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.designation_at_joining || '-'}</td>
                                <td className="px-2 sm:px-3 py-2 border border-gray-300">{row.present_designation || '-'}</td>
                                <td className="hidden xl:table-cell px-2 sm:px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_designated_as_prof ? new Date(row.date_designated_as_prof).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="hidden lg:table-cell px-2 sm:px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_receiving_highest_degree ? new Date(row.date_of_receiving_highest_degree).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="hidden md:table-cell px-2 sm:px-3 py-2 border border-gray-300">{row.nature_of_association || '-'}</td>
                                <td className="px-2 sm:px-3 py-2 border border-gray-300 text-center">{row.working_presently || '-'}</td>
                                <td className="hidden xl:table-cell px-2 sm:px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_leaving ? new Date(row.date_of_leaving).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="px-2 sm:px-3 py-2 border border-gray-300 text-center">{row.experience_years || '-'}</td>
                                <td className="hidden md:table-cell px-2 sm:px-3 py-2 border border-gray-300 text-center">{row.is_hod_principal || '-'}</td>
                                <td className="px-2 sm:px-3 py-2 border border-gray-300 text-center whitespace-nowrap">
                                  {isAdmin() ? (
                                    <button type="button" onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Edit</button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                    )}
                </div>

                {/* AY designation summary table below faculty table */}
                <div className="w-full mt-8">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Number of faculty in the department for both UG and PG</h3>

                  {!selectedProgramId || !selectedAcademicYear ? (
                    <div className="text-sm text-gray-500">Select program and academic year to view CAY summary.</div>
                  ) : isStatsLoading ? (
                    <div className="text-sm text-gray-500">Loading designation summary...</div>
                  ) : statsError ? (
                    <div className="text-sm text-red-600">{statsError}</div>
                  ) : (
                    <>
                      <div className="md:hidden space-y-3">
                        {designationRowOrder.map((designation) => {
                          const row = designationStats?.rows?.find((item) => item.designation === designation);
                          return (
                            <div key={designation} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                              <p className="text-sm font-semibold text-gray-800">{designation}</p>
                              <div className="mt-2 text-xs text-gray-700 space-y-1">
                                <p><span className="font-medium">CAY:</span> {row?.CAY?.display || "0(R) + 0(C)"}</p>
                                <p><span className="font-medium">CAYm1:</span> {row?.CAYm1?.display || "0(R) + 0(C)"}</p>
                                <p><span className="font-medium">CAYm2:</span> {row?.CAYm2?.display || "0(R) + 0(C)"}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="hidden md:block w-full max-w-full overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-[900px] w-full text-left text-xs border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-amber-100 text-gray-900">
                              <th rowSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Designation</th>
                              <th colSpan={3} className="px-3 py-3 border border-gray-300 font-semibold text-center">Number of faculty in the department for both UG and PG</th>
                            </tr>
                            <tr className="bg-amber-100 text-gray-900">
                              <th className="px-3 py-2 border border-gray-300 font-semibold text-center">
                                CAY
                                <div className="text-[11px] font-medium">{designationStats?.labels?.CAY || "-"}</div>
                              </th>
                              <th className="px-3 py-2 border border-gray-300 font-semibold text-center">
                                CAYm1
                                <div className="text-[11px] font-medium">{designationStats?.labels?.CAYm1 || "-"}</div>
                              </th>
                              <th className="px-3 py-2 border border-gray-300 font-semibold text-center">
                                CAYm2
                                <div className="text-[11px] font-medium">{designationStats?.labels?.CAYm2 || "-"}</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {designationRowOrder.map((designation) => {
                              const row = designationStats?.rows?.find((item) => item.designation === designation);
                              return (
                                <tr key={designation} className="hover:bg-gray-50">
                                  <td className="px-3 py-3 border border-gray-300 font-semibold">{designation}</td>
                                  <td className="px-3 py-3 border border-gray-300 text-center">{row?.CAY?.display || "0(R) + 0(C)"}</td>
                                  <td className="px-3 py-3 border border-gray-300 text-center">{row?.CAYm1?.display || "0(R) + 0(C)"}</td>
                                  <td className="px-3 py-3 border border-gray-300 text-center">{row?.CAYm2?.display || "0(R) + 0(C)"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

export default FacultyByDepartment;