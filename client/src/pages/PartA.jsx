import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/api";

const ACCREDITATION_OPTIONS = [
  "Applying first time",
  "Granted provisional accreditation for two years for the period (specify period)",
  "Granted accreditation for 5 years for the period (specify period)",
  "Granted accreditation for 3 years for the period (specify period)",
  "Not accredited (specify visit dates, year)",
  "Withdrawn (specify visit dates, year)",
  "Not eligible for accreditation",
  "Eligible but not applied",
];

const PROGRAM_CONSIDERATION_OPTIONS = ["Yes (For applying course)", "No"];

const PartA = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const {
    selectedProgramId,
    selectedProgramLabel,
    selectedAcademicYear,
    programs,
  } = useFilterStore();

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("institution");

  const TABS = [
    { key: "institution", label: "Institution Details" },
    { key: "programs", label: "Programs" },
    { key: "accreditation", label: "Accreditation" },
    { key: "faculty", label: "Faculty" },
    { key: "students", label: "Students" },
    { key: "visionMission", label: "Vision & Mission" },
    { key: "contacts", label: "Contacts" },
  ];

  // Institute profile
  const [profile, setProfile] = useState(null);
  // All courses/programs
  const [courses, setCourses] = useState([]);
  // Allied mappings
  const [alliedMappings, setAlliedMappings] = useState([]);
  // Faculty designation stats per department
  const [facultyByDept, setFacultyByDept] = useState([]);
  // Program-level details map
  const [programDetails, setProgramDetails] = useState({});

  // Editable local data (for fields not in DB)
  const [programExtras, setProgramExtras] = useState({});
  // key = courseId, value = { initialIntake, intakeIncrease, currentIntake, accreditationStatus, accreditationFrom, accreditationTo, programForConsideration, programDuration, sanctionedIntakes: { "2024-25": 120, ... } }

  // Section 9 - Faculty by department (manual data)
  const [deptFaculty, setDeptFaculty] = useState([]);
  // Section 10 - Student strength by department (manual data)
  const [deptStudents, setDeptStudents] = useState([]);

  // Section 11 & 12 - Vision and Mission
  const [vision, setVision] = useState("");
  const [mission, setMission] = useState([]);

  // Section 13 - Contact info
  const [headContact, setHeadContact] = useState({
    name: "",
    designation: "",
    mobileNo: "",
    emailId: "",
  });
  const [nbaCoordinator, setNbaCoordinator] = useState({
    name: "",
    designation: "",
    mobileNo: "",
    emailId: "",
  });

  // ---- Data fetching ----

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/institute/profile`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setHeadContact({
          name: data.data.headName || "",
          designation: data.data.headDesignation || "",
          mobileNo: data.data.headMobileNo || "",
          emailId: data.data.headEmail || "",
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_URL}/institute/courses`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  const fetchAlliedMappings = async () => {
    try {
      const url = selectedAcademicYear
        ? `${API_URL}/allied-course/mappings?academicYear=${selectedAcademicYear}`
        : `${API_URL}/allied-course/mappings`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setAlliedMappings(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching allied mappings:", err);
    }
  };

  const fetchFacultyStats = async (programId) => {
    if (!programId || !selectedAcademicYear) return null;
    try {
      const res = await fetch(
        `${API_URL}/faculty/stats/designation?program_id=${programId}&academicYear=${selectedAcademicYear}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) return data.data;
    } catch (err) {
      console.error("Error fetching faculty stats:", err);
    }
    return null;
  };

  // Load all data
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([fetchProfile(), fetchCourses(), fetchAlliedMappings()]);

      // Load saved local data from localStorage
      const saved = localStorage.getItem("partA_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.programExtras) setProgramExtras(parsed.programExtras);
          if (parsed.deptFaculty) setDeptFaculty(parsed.deptFaculty);
          if (parsed.deptStudents) setDeptStudents(parsed.deptStudents);
          if (parsed.vision) setVision(parsed.vision);
          if (parsed.mission) setMission(parsed.mission);
          if (parsed.nbaCoordinator) setNbaCoordinator(parsed.nbaCoordinator);
        } catch (e) {
          console.error("Error parsing saved Part A data:", e);
        }
      }
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Auto-save to localStorage
  const saveLocal = () => {
    const data = {
      programExtras,
      deptFaculty,
      deptStudents,
      vision,
      mission,
      nbaCoordinator,
    };
    localStorage.setItem("partA_data", JSON.stringify(data));
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadData();
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchAlliedMappings();
    }
  }, [selectedAcademicYear]);

  // Save to localStorage when editable data changes
  useEffect(() => {
    if (!isLoadingData) {
      saveLocal();
    }
  }, [programExtras, deptFaculty, deptStudents, vision, mission, nbaCoordinator]);

  // ---- Helpers ----

  const getAcademicYearLabels = () => {
    if (!selectedAcademicYear) return [];
    const startYear = parseInt(selectedAcademicYear.split("-")[0]);
    const labels = [];
    for (let i = 0; i < 6; i++) {
      const y = startYear - i;
      labels.push(`${y}-${String(y + 1).slice(-2)}`);
    }
    return labels;
  };

  const formatLevel = (level) => {
    if (!level) return "";
    if (level === "Undergraduate" || level === "UG") return "UG";
    if (level === "Postgraduate" || level === "PG") return "PG";
    return level;
  };

  const formatLevelFull = (level) => {
    if (!level) return "";
    if (level === "UG" || level === "Undergraduate") return "Under Graduate";
    if (level === "PG" || level === "Postgraduate") return "Post Graduate";
    return level;
  };

  // Get extras for a course
  const getExtras = (courseId) => {
    return (
      programExtras[courseId] || {
        initialIntake: "",
        intakeIncrease: "",
        currentIntake: "",
        accreditationStatus: "",
        accreditationFrom: "",
        accreditationTo: "",
        programForConsideration: "",
        programDuration: "4",
        sanctionedIntakes: {},
      }
    );
  };

  const updateExtras = (courseId, field, value) => {
    setProgramExtras((prev) => ({
      ...prev,
      [courseId]: {
        ...getExtras(courseId),
        [field]: value,
      },
    }));
  };

  const updateSanctionedIntake = (courseId, yearLabel, value) => {
    setProgramExtras((prev) => {
      const existing = getExtras(courseId);
      return {
        ...prev,
        [courseId]: {
          ...existing,
          sanctionedIntakes: {
            ...existing.sanctionedIntakes,
            [yearLabel]: value,
          },
        },
      };
    });
  };

  // ---- Faculty dept handlers ----
  const addDeptFacultyRow = () => {
    setDeptFaculty((prev) => [
      ...prev,
      {
        id: Date.now(),
        departmentName: "",
        CAY: { prof: "", asp: "", ap: "", total: "" },
        CAYm1: { prof: "", asp: "", ap: "", total: "" },
        CAYm2: { prof: "", asp: "", ap: "", total: "" },
      },
    ]);
  };

  const updateDeptFaculty = (idx, yearKey, field, value) => {
    setDeptFaculty((prev) => {
      const updated = [...prev];
      if (yearKey) {
        updated[idx] = {
          ...updated[idx],
          [yearKey]: { ...updated[idx][yearKey], [field]: value },
        };
      } else {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  const removeDeptFacultyRow = (idx) => {
    setDeptFaculty((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Student dept handlers ----
  const addDeptStudentRow = () => {
    setDeptStudents((prev) => [
      ...prev,
      { id: Date.now(), departmentName: "", CAY: "", CAYm1: "", CAYm2: "" },
    ]);
  };

  const updateDeptStudent = (idx, field, value) => {
    setDeptStudents((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const removeDeptStudentRow = (idx) => {
    setDeptStudents((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Mission handlers ----
  const addMissionLine = () => {
    setMission((prev) => [...prev, ""]);
  };

  const updateMissionLine = (idx, value) => {
    setMission((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  const removeMissionLine = (idx) => {
    setMission((prev) => prev.filter((_, i) => i !== idx));
  };

  // ---- Export ----
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("SELF ASSESSMENT REPORT (TIER - I)", 14, 15);
    doc.text("Part A : Institutional Information", 14, 25);

    if (profile) {
      autoTable(doc, {
        startY: 35,
        head: [["Field", "Value"]],
        body: [
          ["Name and Address of the Institution", `${profile.instituteName || ""}\n${profile.address || ""}, ${profile.city || ""}, ${profile.state || ""} - ${profile.pinCode || ""}`],
          ["Type of the Institution", profile.institutionType || ""],
          ["Year of Establishment", profile.yearOfEstablishment || ""],
          ["Ownership Status", profile.ownershipStatus || ""],
          ["Affiliating University", `${profile.universityName || ""}\n${profile.universityCity || ""}, ${profile.universityState || ""} - ${profile.universityPinCode || ""}`],
        ],
      });
    }

    doc.save("Part_A_Report.pdf");
  };

  // ---- Filtered courses for selected academic year ----
  const filteredCourses = selectedAcademicYear
    ? courses.filter((c) => {
        const startYear = parseInt(selectedAcademicYear.split("-")[0]);
        if (!c.yearEnd) return true;
        const yearEnd = parseInt(c.yearEnd);
        return yearEnd >= startYear - 2 && yearEnd <= startYear;
      })
    : courses;

  // Get year labels for CAY, CAYm1, CAYm2
  const getCAYLabels = () => {
    if (!selectedAcademicYear) return { CAY: "", CAYm1: "", CAYm2: "" };
    const sy = parseInt(selectedAcademicYear.split("-")[0]);
    return {
      CAY: `${sy}-${String(sy + 1).slice(-2)}`,
      CAYm1: `${sy - 1}-${String(sy).slice(-2)}`,
      CAYm2: `${sy - 2}-${String(sy - 1).slice(-2)}`,
    };
  };

  const cayLabels = getCAYLabels();

  // ---- Render ----

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = isEditing
    ? "w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
    : "w-full bg-transparent border-none outline-none text-sm text-gray-900 cursor-default pointer-events-none";

  const cellClass = "border border-gray-300 px-4 py-2 text-sm";
  const headerCellClass =
    "border border-blue-700 px-4 py-3 text-left text-sm font-semibold";
  const labelCellClass =
    "border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-50";

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          {isLoadingData ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              {/* Academic Year Display */}
              <div className="mb-3 text-sm text-gray-600">
                Academic Year:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedAcademicYear || "All Academic Years"}
                </span>
                {selectedProgramLabel && (
                  <span className="ml-4">
                    Program:{" "}
                    <span className="font-semibold text-gray-800">
                      {selectedProgramLabel}
                    </span>
                  </span>
                )}
              </div>

              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Institutional Information
                </h2>
                <div className="flex items-center gap-4">
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
                  {isAdmin() && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                    >
                      {isEditing ? "Done Editing" : "Edit"}
                    </button>
                  )}
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.key
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* ---- Tab: Institution Details ---- */}
              {activeTab === "institution" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  Institution Details
                </p>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr>
                      <td className={`${labelCellClass} w-2/5`}>
                        Name and Address of the Institution:
                      </td>
                      <td className={cellClass}>
                        <div className="font-semibold">
                          {profile?.instituteName || "—"}
                        </div>
                        <div>
                          {profile?.address || ""}
                          {profile?.city ? `, ${profile.city}` : ""}
                          {profile?.state ? `, ${profile.state}` : ""}
                          {profile?.pinCode ? ` – ${profile.pinCode}` : ""}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCellClass}>
                        Type of the Institution:
                      </td>
                      <td className={cellClass}>
                        {profile?.institutionType || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCellClass}>
                        Year of Establishment of the Institution:
                      </td>
                      <td className={cellClass}>
                        {profile?.yearOfEstablishment || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCellClass}>
                        Ownership Status: (Tick the applicable choice)
                      </td>
                      <td className={cellClass}>
                        {profile?.ownershipStatus || "—"}
                      </td>
                    </tr>
                    <tr>
                      <td className={labelCellClass}>
                        Name and Address of the Affiliating University (if
                        any):
                      </td>
                      <td className={cellClass}>
                        <div className="font-semibold">
                          {profile?.universityName || "—"}
                        </div>
                        <div>
                          {profile?.universityCity || ""}
                          {profile?.universityState
                            ? `, ${profile.universityState}`
                            : ""}
                          {profile?.universityPinCode
                            ? ` - ${profile.universityPinCode}`
                            : ""}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>
              </div>
              )}

              {/* ---- Other Academic Institutions ----
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  Other Academic Institutions of the Trust/Society/Company
                  etc., if any
                </p>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className={`${headerCellClass} w-16`}>S. No.</th>
                      <th className={headerCellClass}>
                        Name of the Institution(s)
                      </th>
                      <th className={headerCellClass}>
                        Year of Establishment
                      </th>
                      <th className={headerCellClass}>Programs of Study</th>
                      <th className={headerCellClass}>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 px-3 py-2 text-sm text-gray-500 text-center"
                      >
                        Not applicable
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div> */}

              {/* ---- Tab: Programs ---- */}
              {activeTab === "programs" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  Details of all the programs being offered by the Institution
                  under consideration:
                </p>
                

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className={headerCellClass}>S.N.</th>
                        <th className={headerCellClass}>Name of Program</th>
                        <th className={headerCellClass}>
                          Program Applied level
                        </th>
                        <th className={headerCellClass}>Start of year</th>
                        <th className={headerCellClass}>
                          Year of AICTE approval
                        </th>
                        <th className={headerCellClass}>Initial Intake</th>
                        <th className={headerCellClass}>Intake Increase</th>
                        <th className={headerCellClass}>Current Intake</th>
                        <th className={headerCellClass}>
                          Accreditation status*
                        </th>
                        <th className={headerCellClass}>From</th>
                        <th className={headerCellClass}>To</th>
                        <th className={headerCellClass}>
                          Program for consideration
                        </th>
                        <th className={headerCellClass}>
                          Program for Duration
                        </th>
                        {isEditing && (
                          <th className={headerCellClass}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isEditing ? 14 : 13}
                            className="border border-gray-300 px-3 py-4 text-center text-gray-400"
                          >
                            No programs found
                          </td>
                        </tr>
                      ) : (
                        filteredCourses.map((course, idx) => {
                          const extras = getExtras(course.id);
                          return (
                            <tr key={course.id} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                              <td className={cellClass}>{idx + 1}</td>
                              <td className={cellClass}>
                                {course.programName}
                              </td>
                              <td className={cellClass}>
                                {formatLevel(course.level)}
                              </td>
                              <td className={cellClass}>
                                {course.yearStart || ""}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={extras.aicteApproval || ""}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "aicteApproval",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  extras.aicteApproval || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={extras.initialIntake}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "initialIntake",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  extras.initialIntake || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <select
                                    value={extras.intakeIncrease}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "intakeIncrease",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  >
                                    <option value="">--</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                  </select>
                                ) : (
                                  extras.intakeIncrease || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={extras.currentIntake}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "currentIntake",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  extras.currentIntake || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <select
                                    value={extras.accreditationStatus}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "accreditationStatus",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  >
                                    <option value="">--</option>
                                    {ACCREDITATION_OPTIONS.map((opt) => (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  extras.accreditationStatus || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={extras.accreditationFrom}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "accreditationFrom",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                    placeholder="Year"
                                  />
                                ) : (
                                  extras.accreditationFrom || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={extras.accreditationTo}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "accreditationTo",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                    placeholder="Year"
                                  />
                                ) : (
                                  extras.accreditationTo || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <select
                                    value={extras.programForConsideration}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "programForConsideration",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  >
                                    <option value="">--</option>
                                    {PROGRAM_CONSIDERATION_OPTIONS.map(
                                      (opt) => (
                                        <option key={opt} value={opt}>
                                          {opt}
                                        </option>
                                      )
                                    )}
                                  </select>
                                ) : (
                                  extras.programForConsideration || ""
                                )}
                              </td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={extras.programDuration}
                                    onChange={(e) =>
                                      updateExtras(
                                        course.id,
                                        "programDuration",
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  extras.programDuration || ""
                                )}
                              </td>
                              {isEditing && <td className={cellClass}></td>}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Sanctioned Intake per program */}
                {filteredCourses.map((course) => {
                  const extras = getExtras(course.id);
                  const yearLabels = getAcademicYearLabels();
                  if (yearLabels.length === 0) return null;

                  return (
                    <div key={`intake-${course.id}`} className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-1 border-b border-gray-200 pb-1">
                        Sanctioned Intake for Last Five Years for the{" "}
                        {course.programName}
                      </p>
                      <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-blue-600 text-white">
                            <th className={`${headerCellClass} min-w-[200px]`}>
                              Academic Year
                            </th>
                            <th className={`${headerCellClass} min-w-[200px]`}>
                              Sanctioned Intake
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {yearLabels.map((yearLabel) => (
                            <tr key={yearLabel}>
                              <td className={cellClass}>{yearLabel}</td>
                              <td className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={
                                      extras.sanctionedIntakes?.[yearLabel] ||
                                      ""
                                    }
                                    onChange={(e) =>
                                      updateSanctionedIntake(
                                        course.id,
                                        yearLabel,
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  extras.sanctionedIntakes?.[yearLabel] || ""
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </div>
                    </div>
                  );
                })}

                {/* Reference notes */}
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                  <p>
                    * Write applicable one: (Drop Down) — Applying first time /
                    Granted provisional accreditation for two years / Granted
                    accreditation for 5 years / Granted accreditation for 3 years
                    / Not accredited / Withdrawn / Not eligible / Eligible but
                    not applied
                  </p>
                  <p>
                    # — Yes (For applying course) / No
                  </p>
                  <p>$ — UG / PG</p>
                </div>
              </div>
              )}

              {/* ---- Tab: Accreditation ---- */}
              {activeTab === "accreditation" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  8. Programs to be considered for Accreditation vide this
                  application:
                </p>

                {/* Table A8.1 */}
                <p className="text-xs text-gray-600 mb-1">Table No. A8.1</p>
                <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className={`${headerCellClass} w-16`}>S No</th>
                      <th className={headerCellClass}>Level</th>
                      <th className={headerCellClass}>Discipline</th>
                      <th className={headerCellClass}>Program</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses
                      .filter(
                        (c) =>
                          getExtras(c.id).programForConsideration ===
                          "Yes (For applying course)"
                      )
                      .map((course, idx) => (
                        <tr key={course.id} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                          <td className={cellClass}>{idx + 1}</td>
                          <td className={cellClass}>
                            {formatLevelFull(course.level)}
                          </td>
                          <td className={cellClass}>
                            {course.discipline || ""}
                          </td>
                          <td className={cellClass}>
                            {course.programName || ""}
                          </td>
                        </tr>
                      ))}
                    {filteredCourses.filter(
                      (c) =>
                        getExtras(c.id).programForConsideration ===
                        "Yes (For applying course)"
                    ).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="border border-gray-300 px-3 py-2 text-sm text-gray-400 text-center"
                        >
                          No programs marked for consideration
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>

                {/* Table A8.2 - Allied Departments */}
                <p className="text-xs text-gray-600 mb-1">Table No. A8.2</p>
                <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className={`${headerCellClass} w-16`}>S No</th>
                      <th className={headerCellClass}>
                        Name of the Department
                      </th>
                      <th className={headerCellClass}>Name of the Program</th>
                      <th className={headerCellClass}>
                        Name of Allied Departments/Cluster
                      </th>
                      <th className={headerCellClass}>
                        Name of Allied Program
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {alliedMappings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="border border-gray-300 px-3 py-2 text-sm text-gray-400 text-center"
                        >
                          No record exist(s)
                        </td>
                      </tr>
                    ) : (
                      alliedMappings.map((mapping, idx) => (
                        <tr key={mapping.groupId} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                          <td className={cellClass}>{idx + 1}</td>
                          <td className={cellClass}>
                            {mapping.mainProgram?.departmentName || ""}
                          </td>
                          <td className={cellClass}>
                            {mapping.mainProgram?.programName || ""}
                          </td>
                          <td className={cellClass}>
                            {(mapping.alliedPrograms || [])
                              .map((p) => p.departmentName)
                              .join(", ")}
                          </td>
                          <td className={cellClass}>
                            {(mapping.alliedPrograms || [])
                              .map((p) => p.programName)
                              .join(", ")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                </div>
              </div>
              )}

              {/* ---- Tab: Faculty ---- */}
              {activeTab === "faculty" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  9. Total Number of Faculty Members in Various Departments:
                </p>
                <p className="text-xs text-gray-500 italic mb-3">
                  &lt;To be entered Manually&gt;
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className={headerCellClass} rowSpan={3}>
                          S. No.
                        </th>
                        <th className={headerCellClass} rowSpan={3}>
                          Name of the Department
                        </th>
                        <th className={headerCellClass} colSpan={12}>
                          Number of faculty members in the Department (UG and
                          PG)
                        </th>
                        {isEditing && (
                          <th className={headerCellClass} rowSpan={3}>
                            Action
                          </th>
                        )}
                      </tr>
                      <tr className="bg-blue-600 text-white">
                        <th className={headerCellClass} colSpan={4}>
                          CAY
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAY || "—"}
                          </span>
                        </th>
                        <th className={headerCellClass} colSpan={4}>
                          CAYm1
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAYm1 || "—"}
                          </span>
                        </th>
                        <th className={headerCellClass} colSpan={4}>
                          CAYm2
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAYm2 || "—"}
                          </span>
                        </th>
                      </tr>
                      <tr className="bg-blue-600 text-white">
                        {["CAY", "CAYm1", "CAYm2"].map((yr) => (
                          <Fragment key={yr}>
                            <th className={headerCellClass}>
                              No. of Prof.
                            </th>
                            <th className={headerCellClass}>
                              No. of ASP
                            </th>
                            <th className={headerCellClass}>
                              No. of AP
                            </th>
                            <th
                              className={headerCellClass}
                            >
                              Total
                            </th>
                          </Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deptFaculty.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isEditing ? 15 : 14}
                            className="border border-gray-300 px-3 py-4 text-center text-gray-400"
                          >
                            No departments added
                          </td>
                        </tr>
                      ) : (
                        deptFaculty.map((dept, idx) => (
                          <tr key={dept.id} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                            <td className={cellClass}>{idx + 1}</td>
                            <td className={cellClass}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={dept.departmentName}
                                  onChange={(e) =>
                                    updateDeptFaculty(
                                      idx,
                                      null,
                                      "departmentName",
                                      e.target.value
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Department Name"
                                />
                              ) : (
                                dept.departmentName
                              )}
                            </td>
                            {["CAY", "CAYm1", "CAYm2"].map((yr) => (
                              <Fragment key={yr}>
                                {["prof", "asp", "ap", "total"].map((f) => (
                                  <td
                                    key={`${yr}-${f}`}
                                    className={cellClass}
                                  >
                                    {isEditing ? (
                                      <input
                                        type="number"
                                        value={dept[yr]?.[f] || ""}
                                        onChange={(e) =>
                                          updateDeptFaculty(
                                            idx,
                                            yr,
                                            f,
                                            e.target.value
                                          )
                                        }
                                        className={`${inputClass} w-16`}
                                      />
                                    ) : (
                                      dept[yr]?.[f] || ""
                                    )}
                                  </td>
                                ))}
                              </Fragment>
                            ))}
                            {isEditing && (
                              <td className={cellClass}>
                                <button
                                  type="button"
                                  onClick={() => removeDeptFacultyRow(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addDeptFacultyRow}
                    className="mt-2 text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                  >
                    + Add Department
                  </button>
                )}
              </div>
              )}

              {/* ---- Tab: Students ---- */}
              {activeTab === "students" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  10. Total Number of Engineering Students in Various
                  Departments:
                </p>
                <p className="text-xs text-gray-500 italic mb-3">
                  &lt;To be entered Manually and verified in Criteria 4&gt;
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-blue-600 text-white">
                        <th className={headerCellClass} rowSpan={2}>
                          S. No.
                        </th>
                        <th className={headerCellClass} rowSpan={2}>
                          Name of the Department
                        </th>
                        <th className={headerCellClass} colSpan={3}>
                          Number of students in the Department (UG and PG)
                        </th>
                        {isEditing && (
                          <th className={headerCellClass} rowSpan={2}>
                            Action
                          </th>
                        )}
                      </tr>
                      <tr className="bg-blue-600 text-white">
                        <th className={headerCellClass}>
                          CAY
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAY || "—"}
                          </span>
                        </th>
                        <th className={headerCellClass}>
                          CAYm1
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAYm1 || "—"}
                          </span>
                        </th>
                        <th className={headerCellClass}>
                          CAYm2
                          <br />
                          <span className="font-normal">
                            {cayLabels.CAYm2 || "—"}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {deptStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isEditing ? 6 : 5}
                            className="border border-gray-300 px-3 py-4 text-center text-gray-400"
                          >
                            No departments added
                          </td>
                        </tr>
                      ) : (
                        deptStudents.map((dept, idx) => (
                          <tr key={dept.id} className={idx % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                            <td className={cellClass}>{idx + 1}</td>
                            <td className={cellClass}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={dept.departmentName}
                                  onChange={(e) =>
                                    updateDeptStudent(
                                      idx,
                                      "departmentName",
                                      e.target.value
                                    )
                                  }
                                  className={inputClass}
                                  placeholder="Department Name"
                                />
                              ) : (
                                dept.departmentName
                              )}
                            </td>
                            {["CAY", "CAYm1", "CAYm2"].map((yr) => (
                              <td key={yr} className={cellClass}>
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={dept[yr] || ""}
                                    onChange={(e) =>
                                      updateDeptStudent(
                                        idx,
                                        yr,
                                        e.target.value
                                      )
                                    }
                                    className={inputClass}
                                  />
                                ) : (
                                  dept[yr] || ""
                                )}
                              </td>
                            ))}
                            {isEditing && (
                              <td className={cellClass}>
                                <button
                                  type="button"
                                  onClick={() => removeDeptStudentRow(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                {isEditing && (
                  <button
                    type="button"
                    onClick={addDeptStudentRow}
                    className="mt-2 text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                  >
                    + Add Department
                  </button>
                )}
              </div>
              )}

              {/* ---- Tab: Vision & Mission ---- */}
              {activeTab === "visionMission" && (
              <>
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  11. Vision of the Institution:
                </p>
                {isEditing ? (
                  <textarea
                    value={vision}
                    onChange={(e) => setVision(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Enter the vision of the institution..."
                  />
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-wrap">
                    {vision || "—"}
                  </div>
                )}
              </div>

              {/* ---- Section 12: Mission ---- */}
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-2">
                  12. Mission of the Institution:
                </p>
                {mission.length === 0 && !isEditing && (
                  <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-400">
                    —
                  </div>
                )}
                {mission.map((line, idx) => (
                  <div key={idx} className="flex items-start gap-2 mb-2">
                    {isEditing ? (
                      <>
                        <textarea
                          value={line}
                          onChange={(e) =>
                            updateMissionLine(idx, e.target.value)
                          }
                          rows={2}
                          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <button
                          type="button"
                          onClick={() => removeMissionLine(idx)}
                          className="text-red-500 hover:text-red-700 text-xs mt-2"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div className="border border-gray-200 rounded-lg p-3 text-sm text-gray-800 flex-1">
                        {line}
                      </div>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    type="button"
                    onClick={addMissionLine}
                    className="mt-2 text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                  >
                    + Add Mission Statement
                  </button>
                )}
              </div>
              </>
              )}

              {/* ---- Tab: Contacts ---- */}
              {activeTab === "contacts" && (
              <div className="mb-8">
                <p className="text-base font-semibold text-gray-800 mb-4">
                  13. Contact Information of the Head of the Institution and NBA
                  coordinator, if designated:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Head of Institution */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Head of the Institution
                    </p>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <tbody>
                        <tr>
                          <td className={`${labelCellClass} w-1/3`}>Name</td>
                          <td className={cellClass}>
                            {profile?.headName || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Designation</td>
                          <td className={cellClass}>
                            {profile?.headDesignation || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Mobile No.</td>
                          <td className={cellClass}>
                            {profile?.headMobileNo || "—"}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Email ID</td>
                          <td className={cellClass}>
                            {profile?.headEmail || "—"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* NBA Coordinator */}
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      NBA Coordinator, If Designated
                    </p>
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                      <tbody>
                        <tr>
                          <td className={`${labelCellClass} w-1/3`}>Name</td>
                          <td className={cellClass}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={nbaCoordinator.name}
                                onChange={(e) =>
                                  setNbaCoordinator((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            ) : (
                              nbaCoordinator.name || "—"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Designation</td>
                          <td className={cellClass}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={nbaCoordinator.designation}
                                onChange={(e) =>
                                  setNbaCoordinator((prev) => ({
                                    ...prev,
                                    designation: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            ) : (
                              nbaCoordinator.designation || "—"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Mobile No.</td>
                          <td className={cellClass}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={nbaCoordinator.mobileNo}
                                onChange={(e) =>
                                  setNbaCoordinator((prev) => ({
                                    ...prev,
                                    mobileNo: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            ) : (
                              nbaCoordinator.mobileNo || "—"
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className={labelCellClass}>Email ID</td>
                          <td className={cellClass}>
                            {isEditing ? (
                              <input
                                type="text"
                                value={nbaCoordinator.emailId}
                                onChange={(e) =>
                                  setNbaCoordinator((prev) => ({
                                    ...prev,
                                    emailId: e.target.value,
                                  }))
                                }
                                className={inputClass}
                              />
                            ) : (
                              nbaCoordinator.emailId || "—"
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PartA;
