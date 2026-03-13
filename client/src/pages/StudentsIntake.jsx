import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const accreditationOptions = [
  "Applying first time",
  "Granted provisional accreditation for two years for the period(specify period)",
  "Granted accreditation for 5 years for the period (specify period)",
  "Granted accreditation for 3 years for the period (specify period)",
  "Not accredited (specify visit dates, year)",
  "Withdrawn (specify visit dates, year)",
  "Not eligible for accreditation",
  "Eligible but not applied",
];

const intakeFields = [
  { label: "Name of Program", name: "programName", type: "select", placeholder: "Select program" },
  { label: "Program Applied Level", name: "programAppliedLevel", readOnly: true },
  { label: "Start of Year", name: "startYear", readOnly: true },
  { label: "Year of AICTE Approval", name: "aicteApprovalYear", placeholder: "e.g. 2024" },
  { label: "Initial Intake", name: "initialIntake", placeholder: "Enter initial intake" },
  { label: "Intake Increase", name: "intakeIncrease", readOnly: true },
  { label: "Current Intake", name: "currentIntake", placeholder: "Enter current intake" },
  {
    label: "Program for Consideration",
    name: "programForConsideration",
    type: "select",
    options: ["Yes", "No"],
  },
  {
    label: "Accreditation Status",
    name: "accreditationStatus",
    type: "select",
    options: accreditationOptions,
    placeholder: "Select accreditation status",
  },
  { label: "From", name: "accreditationFrom", placeholder: "YYYY" },
  { label: "To", name: "accreditationTo", placeholder: "YYYY" },
  { label: "Program Duration", name: "programDuration", placeholder: "e.g. 4" },
  { label: "Academic Year", name: "academicYear", placeholder: "e.g. 2024-25" },
];

const parseAcademicYearStart = (label) => {
  if (!label || !/^\d{4}-\d{2}$/.test(String(label).trim())) return null;
  const start = Number.parseInt(String(label).slice(0, 4), 10);
  const yy = Number.parseInt(String(label).slice(5, 7), 10);
  if ((start + 1) % 100 !== yy) return null;
  return start;
};

const formatAcademicYear = (start) => `${start}-${String((start + 1) % 100).padStart(2, "0")}`;

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getIncreaseFlag = (initial, current) => (toInt(current) > toInt(initial) ? "Yes" : "No");

const buildIntakeSummaryRows = (entries, selectedAcademicYear) => {
  const selectedStart = parseAcademicYearStart(selectedAcademicYear);
  const maxStartFromData = entries.reduce((max, entry) => {
    const start = parseAcademicYearStart(entry.academic_year);
    return start !== null && start > max ? start : max;
  }, -Infinity);

  const baseYear = selectedStart ?? (Number.isFinite(maxStartFromData) ? maxStartFromData : new Date().getFullYear());

  const intakeByYear = entries.reduce((acc, entry) => {
    const label = String(entry.academic_year || "").trim();
    if (!label) return acc;
    const currentIntake = toInt(entry.current_intake);
    acc[label] = (acc[label] || 0) + currentIntake;
    return acc;
  }, {});

  return Array.from({ length: 6 }, (_, offset) => {
    const yearLabel = formatAcademicYear(baseYear - offset);
    const hasYearData = Object.prototype.hasOwnProperty.call(intakeByYear, yearLabel);
    return {
      label: offset === 0 ? "Current Academic Year (CAY)" : `CAY-${offset}`,
      year: yearLabel,
      sanctionedIntake: hasYearData ? intakeByYear[yearLabel] : null,
      hasYearData,
    };
  }).filter((row) => row.hasYearData);
};

const StudentsIntake = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const { selectedAcademicYear, selectedProgramId, selectedProgramLabel, programs } = useFilterStore();

  const [allPrograms, setAllPrograms] = useState([]);
  const [allIntakeEntries, setAllIntakeEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: "", message: "" });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    academicYear: "",
    programName: "",
    programAppliedLevel: "",
    startYear: "",
    aicteApprovalYear: "",
    initialIntake: "",
    intakeIncrease: "No",
    currentIntake: "",
    accreditationStatus: "",
    accreditationFrom: "",
    accreditationTo: "",
    programForConsideration: "Yes",
    programDuration: "",
  });

  const refreshIntakeEntries = async () => {
    setIsLoadingEntries(true);
    try {
        const response = await fetch("http://localhost:5000/api/intake", { credentials: "include" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch intake entries");
      }
      const entries = Array.isArray(data.data) ? data.data : [];
      setAllIntakeEntries(entries);
    } catch (error) {
      console.error("Error fetching intake entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (selectedAcademicYear) {
      setFormData((prev) => ({ ...prev, academicYear: selectedAcademicYear }));
    }
  }, [selectedAcademicYear]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshIntakeEntries();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await fetch("http://localhost:5000/api/institute/courses", {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok || !data.success || !Array.isArray(data.data)) {
          throw new Error(data.error || "Failed to fetch programs");
        }
        setAllPrograms(data.data);
      } catch (error) {
        console.error("Error fetching all programs:", error);
        if (Array.isArray(programs) && programs.length > 0) {
          setAllPrograms(
            programs.map((program) => ({
              id: program.id,
              departmentName: program.coursename,
              programName: program.coursename,
              level: "",
              yearStart: "",
            })),
          );
        }
      }
    };

    fetchPrograms();
  }, [isAuthenticated, programs]);

  const programOptions = useMemo(
    () => allPrograms.filter((p) => p && p.id != null && (p.departmentName || p.programName)),
    [allPrograms],
  );

  const displayedFields = useMemo(
    () =>
      intakeFields.filter(
        (field) =>
          !(
            (field.name === "accreditationFrom" || field.name === "accreditationTo") &&
            formData.accreditationStatus === "Applying first time"
          ),
      ),
    [formData.accreditationStatus],
  );

  const summarySourceEntries = useMemo(() => {
    if (selectedProgramId) {
      // selectedProgramId may be either all_program.id (global filter) or program_name.id.
      const matchingAllProgramIds = new Set(
        allPrograms
          .filter(
            (p) =>
              String(p.id) === String(selectedProgramId) ||
              String(p.programNameId) === String(selectedProgramId),
          )
          .map((p) => String(p.id)),
      );
      return allIntakeEntries.filter((entry) => matchingAllProgramIds.has(String(entry.program_id)));
    }
    return allIntakeEntries;
  }, [allIntakeEntries, selectedProgramId, allPrograms]);

  const filteredIntakeEntries = useMemo(() => summarySourceEntries, [summarySourceEntries]);

  const intakeEntriesByDepartment = useMemo(() => {
    const groups = filteredIntakeEntries.reduce((acc, entry) => {
      const departmentName = String(entry.program_name || "Unknown Department").trim() || "Unknown Department";
      if (!acc[departmentName]) {
        acc[departmentName] = [];
      }
      acc[departmentName].push(entry);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([departmentName, entries]) => ({ departmentName, entries }));
  }, [filteredIntakeEntries]);

  const intakeSummaryRows = useMemo(
    () => buildIntakeSummaryRows(summarySourceEntries, selectedAcademicYear),
    [selectedAcademicYear, summarySourceEntries],
  );

  const intakeSummaryRowsByDepartment = useMemo(() => {
    const groups = filteredIntakeEntries.reduce((acc, entry) => {
      const departmentName = String(entry.program_name || "Unknown Department").trim() || "Unknown Department";
      if (!acc[departmentName]) {
        acc[departmentName] = [];
      }
      acc[departmentName].push(entry);
      return acc;
    }, {});

    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([departmentName, entries]) => ({
        departmentName,
        rows: buildIntakeSummaryRows(entries, selectedAcademicYear),
      }))
      .filter((group) => group.rows.length > 0);
  }, [filteredIntakeEntries, selectedAcademicYear]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "programName") {
      const selectedProgram = allPrograms.find((program) => String(program.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        programName: value,
        programAppliedLevel: selectedProgram?.level || "",
        startYear: selectedProgram?.yearStart ? String(selectedProgram.yearStart) : "",
      }));
      return;
    }

    if (name === "initialIntake" || name === "currentIntake") {
      setFormData((prev) => {
        const nextInitial = name === "initialIntake" ? value : prev.initialIntake;
        const nextCurrent = name === "currentIntake" ? value : prev.currentIntake;
        return {
          ...prev,
          [name]: value,
          intakeIncrease: getIncreaseFlag(nextInitial, nextCurrent),
        };
      });
      return;
    }

    if (name === "accreditationStatus" && value === "Applying first time") {
      setFormData((prev) => ({
        ...prev,
        accreditationStatus: value,
        accreditationFrom: "",
        accreditationTo: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!formData.programName) {
      setSaveStatus({ type: "error", message: "Please select a program." });
      return;
    }

    if (!formData.academicYear) {
      setSaveStatus({ type: "error", message: "Please enter academic year." });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: "", message: "" });

    const payload = {
      program_id: Number.parseInt(formData.programName, 10),
      year_of_aicte_approval: formData.aicteApprovalYear || null,
      initial_intake: formData.initialIntake || null,
      intake_increase: formData.intakeIncrease === "Yes" ? 1 : 0,
      current_intake: formData.currentIntake || null,
      accreditation_status: formData.accreditationStatus || null,
      accreditation_from: formData.accreditationFrom || null,
      accreditation_to: formData.accreditationTo || null,
      program_for_consideration: formData.programForConsideration,
      program_duration: formData.programDuration || null,
      academic_year: formData.academicYear,
    };

    try {
      const response = await fetch("http://localhost:5000/api/intake", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save intake details");
      }

      setSaveStatus({ type: "success", message: "Intake details saved successfully." });
      await refreshIntakeEntries();
    } catch (error) {
      console.error("Error saving intake details:", error);
      setSaveStatus({ type: "error", message: error.message || "Failed to save intake details." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      academicYear: selectedAcademicYear || "",
      programName: "",
      programAppliedLevel: "",
      startYear: "",
      aicteApprovalYear: "",
      initialIntake: "",
      intakeIncrease: "No",
      currentIntake: "",
      accreditationStatus: "",
      accreditationFrom: "",
      accreditationTo: "",
      programForConsideration: "Yes",
      programDuration: "",
    });
  };

  const handleOpenEditModal = (entry) => {
    setEditingEntry(entry);
    setEditFormData({
      aicteApprovalYear: entry.year_of_aicte_approval || "",
      initialIntake: entry.initial_intake || "",
      currentIntake: entry.current_intake || "",
      accreditationStatus: entry.accreditation_status || "",
      accreditationFrom: entry.accreditation_from || "",
      accreditationTo: entry.accreditation_to || "",
      programForConsideration: entry.program_for_consideration === "Yes" ? "Yes" : "No",
      programDuration: entry.program_duration || "",
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "accreditationStatus" && value === "Applying first time") {
      setEditFormData((prev) => ({
        ...prev,
        accreditationStatus: value,
        accreditationFrom: "",
        accreditationTo: "",
      }));
      return;
    }
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEntry(null);
    setEditFormData({});
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingEntry) return;

    setIsSaving(true);
    setSaveStatus({ type: "", message: "" });

    const payload = {
      year_of_aicte_approval: editFormData.aicteApprovalYear || null,
      initial_intake: editFormData.initialIntake || null,
      current_intake: editFormData.currentIntake || null,
      intake_increase:
        getIncreaseFlag(editFormData.initialIntake, editFormData.currentIntake) === "Yes" ? 1 : 0,
      accreditation_status: editFormData.accreditationStatus || null,
      accreditation_from: editFormData.accreditationFrom || null,
      accreditation_to: editFormData.accreditationTo || null,
      program_for_consideration: editFormData.programForConsideration,
      program_duration: editFormData.programDuration || null,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/intake/${editingEntry.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update intake details");
      }

      await refreshIntakeEntries();
      setSaveStatus({ type: "success", message: "Intake details updated successfully." });
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating intake details:", error);
      setSaveStatus({ type: "error", message: error.message || "Failed to update intake details." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm("Are you sure you want to delete this intake entry?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/intake/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete intake entry");
      }
      await refreshIntakeEntries();
    } catch (error) {
      console.error("Error deleting intake entry:", error);
      setSaveStatus({ type: "error", message: error.message || "Failed to delete intake entry." });
    }
  };

  const exportB11ToExcel = () => {
    const hasSummaryData = selectedProgramId
      ? intakeSummaryRows.length > 0
      : intakeSummaryRowsByDepartment.length > 0;

    if (!hasSummaryData) {
      alert("No B1.1 intake data to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (selectedProgramId) {
      const summaryData = intakeSummaryRows.map((row) => ({
        "Academic Year Label": row.label,
        Year: row.year,
        "Sanctioned Intake": row.sanctionedIntake ?? "-",
      }));
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "B1.1 Summary");
    } else {
      intakeSummaryRowsByDepartment.forEach((group) => {
        const summaryData = group.rows.map((row) => ({
          "Academic Year Label": row.label,
          Year: row.year,
          "Sanctioned Intake": row.sanctionedIntake ?? "-",
        }));
        const sheetName = (group.departmentName || "Dept")
          .replace(/[\\/?*[\]:]/g, "")
          .trim()
          .slice(0, 28) || "B1.1";
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet["!cols"] = [{ wch: 30 }, { wch: 16 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, sheetName);
      });
    }

    XLSX.writeFile(workbook, "Students_Intake_B1_1.xlsx");
  };

  const exportEntriesToExcel = () => {
    if (filteredIntakeEntries.length === 0) {
      alert("No intake entries to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const entriesData = filteredIntakeEntries.map((entry, index) => ({
      "S.No": index + 1,
      "Program Name": entry.program_name || "-",
      "Program Level": entry.program_level || "-",
      "AICTE Approval Year": entry.year_of_aicte_approval || "-",
      "Initial Intake": entry.initial_intake || "-",
      "Current Intake": entry.current_intake || "-",
      "Intake Increase": entry.intake_increase === "Yes" || Number(entry.intake_increase) > 0 ? "Yes" : "No",
      "Program for Consideration": entry.program_for_consideration || "-",
      "Accreditation Status": entry.accreditation_status || "-",
      "Accreditation From": entry.accreditation_from || "-",
      "Accreditation To": entry.accreditation_to || "-",
      "Program Duration": entry.program_duration || "-",
      "Academic Year": entry.academic_year || "-",
    }));

    const entriesSheet = XLSX.utils.json_to_sheet(entriesData);
    entriesSheet["!cols"] = [
      { wch: 6 }, { wch: 30 }, { wch: 16 }, { wch: 20 }, { wch: 16 },
      { wch: 16 }, { wch: 16 }, { wch: 24 }, { wch: 36 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 16 },
    ];

    XLSX.utils.book_append_sheet(workbook, entriesSheet, "Intake Entries");
    XLSX.writeFile(workbook, "Students_Intake_Entries.xlsx");
  };

  const exportB11ToPDF = () => {
    const hasSummaryData = selectedProgramId
      ? intakeSummaryRows.length > 0
      : intakeSummaryRowsByDepartment.length > 0;

    if (!hasSummaryData) {
      alert("No B1.1 intake data to export.");
      return;
    }

    const doc = new jsPDF("landscape");
    let startY = 15;

    doc.setFontSize(14);
    doc.text("Students Intake", 14, startY);
    doc.setFontSize(11);
    doc.text("Table B1.1 - Sanctioned Intake", 14, startY + 7);
    if (selectedAcademicYear) {
      doc.setFontSize(10);
      doc.text(`Academic Year: ${selectedAcademicYear}`, 14, startY + 13);
      startY += 18;
    } else {
      startY += 12;
    }

    const renderB11Table = (rows, tableStartY) => {
      autoTable(doc, {
        head: [
          [
            { content: "Academic Year Label", rowSpan: 2, styles: { halign: "center", valign: "middle" } },
            { content: "Table B1.1 - Sanctioned Intake", colSpan: 2, styles: { halign: "center" } },
          ],
          [
            { content: "Year", styles: { halign: "center" } },
            { content: "Sanctioned Intake", styles: { halign: "center" } },
          ],
        ],
        body: rows.map((row) => [row.label, row.year, String(row.sanctionedIntake ?? "-")]),
        startY: tableStartY,
        styles: { fontSize: 9, cellPadding: 2.5, lineColor: [209, 213, 219], lineWidth: 0.1 },
        headStyles: { fillColor: [254, 243, 199], textColor: [17, 24, 39], fontStyle: "bold" },
        bodyStyles: { textColor: [55, 65, 81] },
        theme: "grid",
      });
    };

    if (selectedProgramId) {
      renderB11Table(intakeSummaryRows, startY);
    } else {
      intakeSummaryRowsByDepartment.forEach((group, index) => {
        if (index > 0) {
          doc.addPage();
          startY = 15;
        }
        doc.setFontSize(11);
        doc.text(`Department: ${group.departmentName}`, 14, startY);
        renderB11Table(group.rows, startY + 4);
      });
    }

    doc.save("Students_Intake_B1_1.pdf");
  };

  const exportEntriesToPDF = () => {
    if (filteredIntakeEntries.length === 0) {
      alert("No intake entries to export.");
      return;
    }

    const doc = new jsPDF("landscape");
    let startY = 15;

    doc.setFontSize(14);
    doc.text("Students Intake", 14, startY);
    if (selectedAcademicYear) {
      doc.setFontSize(10);
      doc.text(`Academic Year: ${selectedAcademicYear}`, 14, startY + 6);
      startY += 14;
    } else {
      startY += 8;
    }

    const tableHeaders = [
      "S.No", "Program Name", "Level", "AICTE Year",
      "Initial", "Current", "Increase", "For Consideration",
      "Accreditation Status", "From", "To", "Duration", "Acad. Year",
    ];

    const buildBody = (entries) =>
      entries.map((entry, index) => [
        String(index + 1),
        entry.program_name || "-",
        entry.program_level || "-",
        entry.year_of_aicte_approval || "-",
        entry.initial_intake || "-",
        entry.current_intake || "-",
        entry.intake_increase === "Yes" || Number(entry.intake_increase) > 0 ? "Yes" : "No",
        entry.program_for_consideration || "-",
        entry.accreditation_status || "-",
        entry.accreditation_from || "-",
        entry.accreditation_to || "-",
        entry.program_duration || "-",
        entry.academic_year || "-",
      ]);

    doc.setFontSize(11);
    doc.text("All Intake Entries", 14, startY);

    if (selectedProgramId) {
      autoTable(doc, {
        head: [tableHeaders],
        body: buildBody(filteredIntakeEntries),
        startY: startY + 4,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [239, 246, 255] },
        theme: "grid",
      });
    } else {
      intakeEntriesByDepartment.forEach(({ departmentName, entries }, sectionIndex) => {
        const sectionStartY =
          sectionIndex === 0
            ? startY + 4
            : (doc.lastAutoTable?.finalY || startY) + 12;
        doc.setFontSize(10);
        doc.text(`Department: ${departmentName}`, 14, sectionStartY - 4);
        autoTable(doc, {
          head: [tableHeaders],
          body: buildBody(entries),
          startY: sectionStartY,
          styles: { fontSize: 7, cellPadding: 2 },
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [239, 246, 255] },
          theme: "grid",
        });
      });
    }

    doc.save("Students_Intake_Entries.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Navbar />
      <TopBar />
      <main className="flex-1 min-w-0 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14 max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="mb-4 border-b border-gray-200 pb-3 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Students Intake</h1>
                <p className="mt-1 text-xs text-gray-600">
                  Academic Year: <span className="font-medium text-gray-800">{selectedAcademicYear || "Not selected"}</span>
                </p>
              </div>
              {isAdmin() && (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  aria-expanded={showForm}
                >
                  {showForm ? "Close Intake Form" : "Intake Form"}
                </button>
              )}
            </div>

            {isAdmin() && showForm && (
              <form
                onSubmit={handleFormSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="col-span-full text-sm font-semibold text-gray-800">Add Intake Details</h3>

                {displayedFields.map((field) => (
                  <div key={field.name} className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">{field.label}</label>

                    {field.name === "programName" ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">{programOptions.length ? "Select program" : "No programs available"}</option>
                        {programOptions.map((program) => (
                          <option key={program.id} value={String(program.id)}>
                            {program.departmentName || program.programName}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {field.name !== "programForConsideration" && (
                          <option value="">{field.placeholder || "Select"}</option>
                        )}
                        {(field.options || []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly === true}
                        className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                  </div>
                ))}

                <div className="col-span-full flex items-center justify-end gap-3 pt-2">
                  {saveStatus.message && (
                    <p className={`mr-auto text-sm ${saveStatus.type === "error" ? "text-red-600" : "text-green-600"}`}>
                      {saveStatus.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isSaving ? "Saving..." : "Save Intake"}
                  </button>
                </div>
              </form>
            )}

            <section className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Table B1.1</h2>
                {(intakeSummaryRows.length > 0 || intakeSummaryRowsByDepartment.length > 0) && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={exportB11ToExcel}
                      className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={exportB11ToPDF}
                      className="text-red-600 hover:text-red-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                )}
              </div>
              {selectedProgramId ? (
                intakeSummaryRows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="min-w-[900px] w-full text-left text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-amber-100 text-gray-900">
                        <th rowSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Academic Year Label</th>
                        <th colSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Table B1.1 - Sanctioned Intake</th>
                      </tr>
                      <tr className="bg-amber-100 text-gray-900">
                        <th className="px-3 py-2 border border-gray-300 font-semibold text-center">Year</th>
                        <th className="px-3 py-2 border border-gray-300 font-semibold text-center">Sanctioned Intake</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {intakeSummaryRows.map((row) => (
                        <tr key={row.label} className="hover:bg-gray-50">
                          <td className="px-3 py-3 border border-gray-300 font-semibold">{row.label}</td>
                          <td className="px-3 py-3 border border-gray-300 text-center">{row.year}</td>
                          <td className="px-3 py-3 border border-gray-300 text-center">{row.sanctionedIntake}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                    <p className="text-sm text-gray-500">No B1.1 intake data available for this department.</p>
                  </div>
                )
              ) : intakeSummaryRowsByDepartment.length > 0 ? (
                <div className="space-y-6">
                  {intakeSummaryRowsByDepartment.map((group) => (
                    <div key={group.departmentName}>
                      <h3 className="mb-2 text-base font-semibold text-gray-800">{group.departmentName}</h3>
                      <div className="overflow-x-auto rounded-lg border border-gray-300">
                        <table className="min-w-[900px] w-full text-left text-xs border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-amber-100 text-gray-900">
                              <th rowSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Academic Year Label</th>
                              <th colSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Table B1.1 - Sanctioned Intake</th>
                            </tr>
                            <tr className="bg-amber-100 text-gray-900">
                              <th className="px-3 py-2 border border-gray-300 font-semibold text-center">Year</th>
                              <th className="px-3 py-2 border border-gray-300 font-semibold text-center">Sanctioned Intake</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {group.rows.map((row) => (
                              <tr key={`${group.departmentName}-${row.label}`} className="hover:bg-gray-50">
                                <td className="px-3 py-3 border border-gray-300 font-semibold">{row.label}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center">{row.year}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center">{row.sanctionedIntake}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[180px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <p className="text-sm text-gray-500">No B1.1 intake data available.</p>
                </div>
              )}
            </section>

            <section className="w-full">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">All Intake Entries</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isLoadingEntries
                      ? "Loading entries..."
                      : selectedProgramId
                        ? `Showing ${filteredIntakeEntries.length} entries for ${selectedProgramLabel || "selected department"}`
                        : `Showing ${filteredIntakeEntries.length} saved entries`}
                  </p>
                </div>
                {!isLoadingEntries && filteredIntakeEntries.length > 0 && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={exportEntriesToExcel}
                      className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={exportEntriesToPDF}
                      className="text-red-600 hover:text-red-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                )}
              </div>

              {isLoadingEntries ? (
                <div className="flex justify-center items-center min-h-[240px]">
                  <div className="w-8 h-8 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
                </div>
              ) : filteredIntakeEntries.length > 0 ? (
                selectedProgramId ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-300">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Name</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Level</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">AICTE Year</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Initial Intake</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Current Intake</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Intake Increase</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program for Consideration</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation Status</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation From</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation To</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Duration</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Academic Year</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {filteredIntakeEntries.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3 text-gray-700">{entry.program_name || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.program_level || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.year_of_aicte_approval || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.initial_intake || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.current_intake || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">
                              {entry.intake_increase === "Yes" || Number(entry.intake_increase) > 0 ? "Yes" : "No"}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{entry.program_for_consideration || "-"}</td>
                            <td className="px-4 py-3 text-gray-700 max-w-xs truncate" title={entry.accreditation_status || "-"}>
                              {entry.accreditation_status || "-"}
                            </td>
                            <td className="px-4 py-3 text-gray-700">{entry.accreditation_from || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.accreditation_to || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.program_duration || "-"}</td>
                            <td className="px-4 py-3 text-gray-700">{entry.academic_year || "-"}</td>
                            <td className="px-4 py-3 text-center">
                              {isAdmin() && (
                                <div className="inline-flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(entry)}
                                    className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {intakeEntriesByDepartment.map((group) => (
                      <div key={group.departmentName}>
                        <h3 className="mb-2 text-base font-semibold text-gray-800">{group.departmentName}</h3>
                        <div className="overflow-x-auto rounded-lg border border-gray-300">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Name</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Level</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">AICTE Year</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Initial Intake</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Current Intake</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Intake Increase</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program for Consideration</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation Status</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation From</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Accreditation To</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Program Duration</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Academic Year</th>
                                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white">
                              {group.entries.map((entry) => (
                                <tr key={entry.id} className="border-b border-gray-300 hover:bg-blue-50 transition-colors">
                                  <td className="px-4 py-3 text-gray-700">{entry.program_name || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.program_level || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.year_of_aicte_approval || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.initial_intake || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.current_intake || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">
                                    {entry.intake_increase === "Yes" || Number(entry.intake_increase) > 0 ? "Yes" : "No"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">{entry.program_for_consideration || "-"}</td>
                                  <td
                                    className="px-4 py-3 text-gray-700 max-w-xs truncate"
                                    title={entry.accreditation_status || "-"}
                                  >
                                    {entry.accreditation_status || "-"}
                                  </td>
                                  <td className="px-4 py-3 text-gray-700">{entry.accreditation_from || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.accreditation_to || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.program_duration || "-"}</td>
                                  <td className="px-4 py-3 text-gray-700">{entry.academic_year || "-"}</td>
                                  <td className="px-4 py-3 text-center">
                                    {isAdmin() && (
                                      <div className="inline-flex gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditModal(entry)}
                                          className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteEntry(entry.id)}
                                          className="inline-flex items-center justify-center px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs font-medium"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex min-h-[240px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <p className="text-base font-medium text-gray-700">No intake entries found for this department.</p>
                    <p className="mt-2 text-sm text-gray-500">Try changing the department filter or add entries from the intake form.</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>

        {showEditModal && editingEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Edit Intake Entry</h2>
                <button type="button" onClick={handleCloseEditModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of AICTE Approval</label>
                    <input
                      type="text"
                      name="aicteApprovalYear"
                      value={editFormData.aicteApprovalYear || ""}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Intake</label>
                    <input
                      type="text"
                      name="initialIntake"
                      value={editFormData.initialIntake || ""}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Intake</label>
                    <input
                      type="text"
                      name="currentIntake"
                      value={editFormData.currentIntake || ""}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program Duration</label>
                    <input
                      type="text"
                      name="programDuration"
                      value={editFormData.programDuration || ""}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation Status</label>
                    <select
                      name="accreditationStatus"
                      value={editFormData.accreditationStatus || ""}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select accreditation status</option>
                      {accreditationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Program for Consideration</label>
                    <select
                      name="programForConsideration"
                      value={editFormData.programForConsideration || "Yes"}
                      onChange={handleEditInputChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  {editFormData.accreditationStatus !== "Applying first time" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation From</label>
                        <input
                          type="text"
                          name="accreditationFrom"
                          value={editFormData.accreditationFrom || ""}
                          onChange={handleEditInputChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Accreditation To</label>
                        <input
                          type="text"
                          name="accreditationTo"
                          value={editFormData.accreditationTo || ""}
                          onChange={handleEditInputChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentsIntake;
