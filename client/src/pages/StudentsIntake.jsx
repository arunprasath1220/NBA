import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      // selectedProgramId is from program_name table; intake uses all_program IDs.
      // Find all_program IDs whose programNameId matches selectedProgramId.
      const matchingAllProgramIds = new Set(
        allPrograms
          .filter((p) => String(p.programNameId) === String(selectedProgramId))
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />
      <TopBar />
      <main className="flex-1 min-w-0 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14 max-w-full">
          <div className="w-full max-w-full space-y-6">
            <div className="mb-4 text-sm text-gray-600">
              Academic Year: <span className="font-semibold text-gray-800">{selectedAcademicYear || "Not selected"}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Students Intake</h1>

            {isAdmin() && (
              <form onSubmit={handleFormSubmit} className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Intake Form</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter the intake details in the format below.</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-300 mb-6">
                  <div className="inline-block min-w-full">
                    <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${displayedFields.length}, minmax(120px, 1fr))` }}>
                      {displayedFields.map((field) => (
                        <div key={field.name} className="bg-gray-100 border border-gray-300 px-3 py-4 text-center font-semibold text-sm text-gray-800">
                          {field.label}
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${displayedFields.length}, minmax(120px, 1fr))` }}>
                      {displayedFields.map((field) => (
                        <div key={field.name} className="border border-gray-300 p-3">
                          {field.name === "programName" ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            >
                              {field.name !== "programForConsideration" && <option value="">{field.placeholder || "Select"}</option>}
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
                              className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Table B1.1</h2>
              {selectedProgramId ? (
                intakeSummaryRows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-amber-100">
                        <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Academic Year</th>
                        <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Year</th>
                        <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Sanctioned Intake</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intakeSummaryRows.map((row) => (
                        <tr key={row.label}>
                          <td className="border border-gray-300 px-3 py-3 font-medium">{row.label}</td>
                          <td className="border border-gray-300 px-3 py-3 text-gray-600">{row.year}</td>
                          <td className="border border-gray-300 px-3 py-3">{row.sanctionedIntake}</td>
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
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-amber-100">
                              <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Academic Year</th>
                              <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Year</th>
                              <th className="border border-gray-300 px-3 py-3 text-left font-semibold">Sanctioned Intake</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rows.map((row) => (
                              <tr key={`${group.departmentName}-${row.label}`}>
                                <td className="border border-gray-300 px-3 py-3 font-medium">{row.label}</td>
                                <td className="border border-gray-300 px-3 py-3 text-gray-600">{row.year}</td>
                                <td className="border border-gray-300 px-3 py-3">{row.sanctionedIntake}</td>
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
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">All Intake Entries</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {isLoadingEntries
                    ? "Loading entries..."
                    : selectedProgramId
                      ? `Showing ${filteredIntakeEntries.length} entries for ${selectedProgramLabel || "selected department"}`
                      : `Showing ${filteredIntakeEntries.length} saved entries`}
                </p>
              </div>

              {isLoadingEntries ? (
                <div className="flex justify-center items-center min-h-[240px]">
                  <div className="w-8 h-8 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
                </div>
              ) : filteredIntakeEntries.length > 0 ? (
                selectedProgramId ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-300">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 border-b border-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Level</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">AICTE Year</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Initial Intake</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Current Intake</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Intake Increase</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Program for Consideration</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation From</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation To</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Duration</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Academic Year</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-800">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIntakeEntries.map((entry) => (
                          <tr key={entry.id} className="border-b border-gray-300 hover:bg-gray-50">
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
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 border-b border-gray-300">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Level</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">AICTE Year</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Initial Intake</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Current Intake</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Intake Increase</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Program for Consideration</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation Status</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation From</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Accreditation To</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Program Duration</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Academic Year</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-800">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.entries.map((entry) => (
                                <tr key={entry.id} className="border-b border-gray-300 hover:bg-gray-50">
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
            </div>
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
