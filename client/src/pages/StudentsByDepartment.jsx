import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const studyYears = ["2nd Year", "3rd Year", "4th Year"];

const yearToStudyNumber = {
  "2nd Year": 2,
  "3rd Year": 3,
  "4th Year": 4,
};

const StudentsByDepartment = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const { selectedAcademicYear, selectedProgramId, selectedProgramLabel } = useFilterStore();

  const [showForm, setShowForm] = useState(false);
  const [sanctionByStudyYear, setSanctionByStudyYear] = useState({
    "2nd Year": 0,
    "3rd Year": 0,
    "4th Year": 0,
  });
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);
  const [isLoadingSummaryData, setIsLoadingSummaryData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [departmentSummaries, setDepartmentSummaries] = useState([]);
  const [actualAdmissions, setActualAdmissions] = useState({
    "2nd Year": "",
    "3rd Year": "",
    "4th Year": "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchStudentByDepartment = async () => {
      if (!selectedProgramId || !selectedAcademicYear?.trim()) {
        setSanctionByStudyYear({
          "2nd Year": 0,
          "3rd Year": 0,
          "4th Year": 0,
        });
        setActualAdmissions({
          "2nd Year": "",
          "3rd Year": "",
          "4th Year": "",
        });
        return;
      }

      setIsLoadingFormData(true);
      try {
        const params = new URLSearchParams({
          program_id: selectedProgramId,
          academic_year: selectedAcademicYear.trim(),
        });

        const response = await fetch(`http://localhost:5000/api/student-by-department?${params.toString()}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load student by department data");
        }

        const sanctionMap = {
          "2nd Year": 0,
          "3rd Year": 0,
          "4th Year": 0,
        };

        (data.data?.rows || []).forEach((row) => {
          const year = Number(row.year_of_study);
          if (year === 2) sanctionMap["2nd Year"] = Number(row.sanction_intake || 0);
          if (year === 3) sanctionMap["3rd Year"] = Number(row.sanction_intake || 0);
          if (year === 4) sanctionMap["4th Year"] = Number(row.sanction_intake || 0);
        });

        setSanctionByStudyYear(sanctionMap);

        const rowValueByYear = (data.data?.rows || []).reduce((acc, row) => {
          const year = Number(row.year_of_study);
          if (year === 2) acc["2nd Year"] = String(row.actual_lateral_admitted || 0);
          if (year === 3) acc["3rd Year"] = String(row.actual_lateral_admitted || 0);
          if (year === 4) acc["4th Year"] = String(row.actual_lateral_admitted || 0);
          return acc;
        }, {
          "2nd Year": "",
          "3rd Year": "",
          "4th Year": "",
        });

        setActualAdmissions(rowValueByYear);
      } catch (error) {
        console.error("Error loading student by department data:", error);
      } finally {
        setIsLoadingFormData(false);
      }
    };

    fetchStudentByDepartment();
  }, [selectedProgramId, selectedAcademicYear]);

  useEffect(() => {
    const fetchDepartmentSummary = async () => {
      if (!selectedAcademicYear?.trim()) {
        setDepartmentSummaries([]);
        return;
      }

      setIsLoadingSummaryData(true);
      try {
        const params = new URLSearchParams({
          academic_year: selectedAcademicYear.trim(),
        });

        const response = await fetch(`http://localhost:5000/api/student-by-department?${params.toString()}`, {
          credentials: "include",
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load student by department summary");
        }

        setDepartmentSummaries(data.data?.departments || []);
      } catch (error) {
        console.error("Error loading department student summary:", error);
        setDepartmentSummaries([]);
      } finally {
        setIsLoadingSummaryData(false);
      }
    };

    fetchDepartmentSummary();
  }, [selectedAcademicYear]);

  const getStudyYearValues = (programRows = [], yearNumber) => {
    const yearRow = programRows.find((row) => Number(row.year_of_study) === Number(yearNumber));
    return {
      sanction: Number(yearRow?.sanction_intake || 0),
      actual: Number(yearRow?.actual_lateral_admitted || 0),
    };
  };

  const totals = useMemo(() => {
    const actualSubtotal = studyYears.reduce(
      (sum, yearLabel) => sum + (Number.parseInt(actualAdmissions[yearLabel], 10) || 0),
      0,
    );
    const sanctionSubtotal = studyYears.reduce(
      (sum, yearLabel) => sum + (Number.parseInt(sanctionByStudyYear[yearLabel], 10) || 0),
      0,
    );

    return {
      sanctionSubtotal,
      actualSubtotal,
      total: sanctionSubtotal + actualSubtotal,
    };
  }, [actualAdmissions, sanctionByStudyYear]);

  const handleActualAdmissionChange = (yearLabel, value) => {
    if (yearLabel !== "2nd Year") {
      return;
    }

    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setActualAdmissions((prev) => ({
      ...prev,
      [yearLabel]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProgramId) {
      setSubmitStatus({ type: "error", message: "Please select a program before submitting." });
      return;
    }

    if (!selectedAcademicYear?.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter Academic Year before submitting." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      const payload = {
        program_id: Number.parseInt(selectedProgramId, 10),
        academic_year: selectedAcademicYear.trim(),
        rows: studyYears.map((label) => ({
          year_of_study: yearToStudyNumber[label],
          actual_lateral_admitted: Number.parseInt(actualAdmissions[label], 10) || 0,
        })),
      };

      const response = await fetch("http://localhost:5000/api/student-by-department", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to save student by department data");
      }

      setSubmitStatus({
        type: "success",
        message: "Student by department data saved successfully.",
      });
    } catch (error) {
      console.error("Error saving student by department data:", error);
      setSubmitStatus({
        type: "error",
        message: error.message || "Failed to save student by department data.",
      });
    } finally {
      setIsSubmitting(false);
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
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-xl font-semibold text-gray-800">Student Details by Department</h1>
              {isAdmin() && (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="self-start rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                >
                  {showForm ? "Close Entry" : "Student by Department"}
                </button>
              )}
            </div>

            {!showForm ? (
              <section className="w-full space-y-6">
                {departmentSummaries.map((department) => (
                  <div key={department.department_name} className="space-y-2">
                    <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
                      {department.department_name}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-[1200px] w-full text-left text-xs border-collapse border border-gray-300">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Program</th>
                            <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">2nd Year</th>
                            <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">3rd Year</th>
                            <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">4th Year</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sub-Total (Sanction)</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sub-Total (Actual)</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Total</th>
                          </tr>
                          <tr>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Academic Year</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Sanction</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Actual</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Sanction</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Actual</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Sanction</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">Actual</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">-</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">-</th>
                            <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white text-gray-800">-</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {(department.programs || []).map((program) => {
                            const second = getStudyYearValues(program.rows, 2);
                            const third = getStudyYearValues(program.rows, 3);
                            const fourth = getStudyYearValues(program.rows, 4);
                            const sanctionSubtotal = second.sanction + third.sanction + fourth.sanction;
                            const actualSubtotal = second.actual + third.actual + fourth.actual;

                            return (
                              <tr key={program.program_id} className="hover:bg-gray-50">
                                <td className="px-3 py-3 border border-gray-300 font-medium text-gray-900">{program.program_name}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{second.sanction}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{second.actual}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{third.sanction}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{third.actual}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{fourth.sanction}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{fourth.actual}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{sanctionSubtotal}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{actualSubtotal}</td>
                                <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">{sanctionSubtotal + actualSubtotal}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {isLoadingSummaryData
                      ? "Loading department-wise student details..."
                      : !selectedAcademicYear
                        ? "Select Academic Year from the top global filter."
                        : departmentSummaries.length === 0
                          ? "No department data found for selected academic year."
                          : "Showing all courses grouped by department for selected academic year."}
                  </p>
                </div>

                {isAdmin() && (
                  <p className="text-sm text-gray-600">
                    Click <span className="font-semibold text-blue-600">Student by Department</span> in the top right to open the entry form.
                  </p>
                )}
              </section>
            ) : (
              <form onSubmit={handleSubmit} className="w-full overflow-hidden">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Table B1.1 Entry</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter only 2nd Year value for selected CAY; progression is auto-derived.</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="min-w-[700px] w-full text-left text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th
                          colSpan={3}
                          className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900"
                        >
                          Name of the Program <span className="font-bold">{selectedProgramLabel || "<Selected Program>"}</span>
                        </th>
                      </tr>
                      <tr>
                        <th
                          rowSpan={2}
                          className="w-[140px] px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900 align-top"
                        >
                          Year of Study
                        </th>
                        <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">
                          Sanction Intake
                        </th>
                        <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">
                          Actual admitted in Lateral Entry
                        </th>
                      </tr>
                      <tr>
                        <th colSpan={3} className="px-3 py-3 border border-gray-300 text-center bg-white">
                          <div className="flex items-center justify-center gap-3">
                            <span className="font-semibold text-gray-900">Academic Year</span>
                            <span className="inline-block w-[180px] rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-center font-semibold text-gray-900">
                              {selectedAcademicYear || "-"}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {studyYears.map((yearLabel) => (
                        <tr key={yearLabel} className="hover:bg-gray-50">
                          <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-white">
                            {yearLabel}
                          </td>
                          <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">
                            {selectedProgramId && selectedAcademicYear?.trim() ? sanctionByStudyYear[yearLabel] || 0 : "-"}
                          </td>
                          <td className="px-3 py-2 border border-gray-300 text-center">
                            {yearLabel === "2nd Year" ? (
                              <input
                                type="text"
                                value={actualAdmissions[yearLabel]}
                                onChange={(event) => handleActualAdmissionChange(yearLabel, event.target.value)}
                                placeholder="0"
                                className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-center outline-none focus:border-blue-500"
                              />
                            ) : (
                              <span className="inline-block w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-center text-gray-700">
                                {actualAdmissions[yearLabel] || 0}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">
                          Sub-Total
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">
                          {totals.sanctionSubtotal}
                        </td>
                        <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">
                          {totals.actualSubtotal}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">
                          Total
                        </td>
                        <td colSpan={2} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">
                          {totals.total}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Selected Program: <span className="font-semibold text-gray-800">{selectedProgramLabel}</span>
                  </p>
                  <p>
                    {isLoadingFormData
                      ? "Loading program and intake details..."
                      : "Enter only 2nd Year. 3rd and 4th Year lateral entries are auto-carried from previous years."}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-end gap-4">
                  {submitStatus.message && (
                    <p className={`mr-auto text-sm ${submitStatus.type === "error" ? "text-red-600" : "text-green-600"}`}>
                      {submitStatus.message}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setActualAdmissions({ "2nd Year": "", "3rd Year": actualAdmissions["3rd Year"], "4th Year": actualAdmissions["4th Year"] })}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentsByDepartment;
