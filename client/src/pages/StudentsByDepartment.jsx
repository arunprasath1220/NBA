import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const studyYears = ["2nd Year", "3rd Year", "4th Year"];
const summaryBuckets = ["cay", "caym1", "caym2"];

const yearToStudyNumber = {
  "2nd Year": 2,
  "3rd Year": 3,
  "4th Year": 4,
};

const formatAcademicYear = (startYear) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const parseAcademicYearStart = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (/^\d{4}-\d{2}$/.test(raw)) {
    const start = Number.parseInt(raw.slice(0, 4), 10);
    const yy = Number.parseInt(raw.slice(5, 7), 10);
    if ((start + 1) % 100 !== yy) return null;
    return start;
  }

  if (/^\d{4}$/.test(raw)) {
    return Number.parseInt(raw, 10);
  }

  return null;
};

const emptySummaryData = (yearLabel = "") => ({
  academicYear: yearLabel,
  sanctionByStudyYear: {
    "2nd Year": 0,
    "3rd Year": 0,
    "4th Year": 0,
  },
  actualByStudyYear: {
    "2nd Year": 0,
    "3rd Year": 0,
    "4th Year": 0,
  },
  sanctionSubtotal: 0,
  actualSubtotal: 0,
  total: 0,
});

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
  const [threeYearSummary, setThreeYearSummary] = useState({
    cay: emptySummaryData(),
    caym1: emptySummaryData(),
    caym2: emptySummaryData(),
  });
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
    const fetchThreeYearSummary = async () => {
      const baseYearStart = parseAcademicYearStart(selectedAcademicYear);

      if (!selectedProgramId || baseYearStart === null) {
        setThreeYearSummary({
          cay: emptySummaryData(baseYearStart !== null ? formatAcademicYear(baseYearStart) : ""),
          caym1: emptySummaryData(baseYearStart !== null ? formatAcademicYear(baseYearStart - 1) : ""),
          caym2: emptySummaryData(baseYearStart !== null ? formatAcademicYear(baseYearStart - 2) : ""),
        });
        return;
      }

      setIsLoadingSummaryData(true);
      try {
        const years = {
          cay: formatAcademicYear(baseYearStart),
          caym1: formatAcademicYear(baseYearStart - 1),
          caym2: formatAcademicYear(baseYearStart - 2),
        };

        const responses = await Promise.all(
          summaryBuckets.map(async (bucket) => {
            const params = new URLSearchParams({
              program_id: selectedProgramId,
              academic_year: years[bucket],
            });

            const response = await fetch(`http://localhost:5000/api/student-by-department?${params.toString()}`, {
              credentials: "include",
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
              return { bucket, year: years[bucket], data: emptySummaryData(years[bucket]) };
            }

            const sanctionByStudyYear = {
              "2nd Year": 0,
              "3rd Year": 0,
              "4th Year": 0,
            };

            const actualByStudyYear = {
              "2nd Year": 0,
              "3rd Year": 0,
              "4th Year": 0,
            };

            (data.data?.rows || []).forEach((row) => {
              const yearOfStudy = Number(row.year_of_study);
              const sanction = Number(row.sanction_intake || 0);
              const actual = Number(row.actual_lateral_admitted || 0);
              if (yearOfStudy === 2) {
                sanctionByStudyYear["2nd Year"] = sanction;
                actualByStudyYear["2nd Year"] = actual;
              }
              if (yearOfStudy === 3) {
                sanctionByStudyYear["3rd Year"] = sanction;
                actualByStudyYear["3rd Year"] = actual;
              }
              if (yearOfStudy === 4) {
                sanctionByStudyYear["4th Year"] = sanction;
                actualByStudyYear["4th Year"] = actual;
              }
            });

            const sanctionSubtotal = studyYears.reduce(
              (sum, label) => sum + (Number.parseInt(sanctionByStudyYear[label], 10) || 0),
              0,
            );

            const actualSubtotal = studyYears.reduce(
              (sum, label) => sum + (Number.parseInt(actualByStudyYear[label], 10) || 0),
              0,
            );

            return {
              bucket,
              data: {
                academicYear: years[bucket],
                sanctionByStudyYear,
                actualByStudyYear,
                sanctionSubtotal,
                actualSubtotal,
                total: sanctionSubtotal + actualSubtotal,
              },
            };
          }),
        );

        const summaryObject = responses.reduce(
          (acc, item) => {
            acc[item.bucket] = item.data;
            return acc;
          },
          {
            cay: emptySummaryData(years.cay),
            caym1: emptySummaryData(years.caym1),
            caym2: emptySummaryData(years.caym2),
          },
        );

        setThreeYearSummary(summaryObject);
      } catch (error) {
        console.error("Error loading three-year student summary:", error);
      } finally {
        setIsLoadingSummaryData(false);
      }
    };

    fetchThreeYearSummary();
  }, [selectedProgramId, selectedAcademicYear]);

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
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Student Details by Department</h1>
              {isAdmin() && (
                <button
                  type="button"
                  onClick={() => setShowForm((prev) => !prev)}
                  className="self-start text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Student by Department
                </button>
              )}
            </div>

            {!showForm ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Last Three Years Overview</h2>
                  <p className="text-sm text-gray-600">Using global filters from top bar.</p>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="min-w-[980px] w-full text-left text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th colSpan={7} className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">
                          Name of the Program <span className="font-bold">{selectedProgramLabel}</span>
                        </th>
                      </tr>
                      <tr>
                        <th rowSpan={3} className="w-[140px] px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900 align-top">
                          Year of Study
                        </th>
                        <th colSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAY</th>
                        <th colSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAYm1</th>
                        <th colSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAYm2</th>
                      </tr>
                      <tr>
                        <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white">{threeYearSummary.cay.academicYear || "-"}</th>
                        <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white">{threeYearSummary.caym1.academicYear || "-"}</th>
                        <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-white">{threeYearSummary.caym2.academicYear || "-"}</th>
                      </tr>
                      <tr>
                        {summaryBuckets.flatMap((bucket) => [
                          <th key={`${bucket}-sanction`} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sanction Intake</th>,
                          <th key={`${bucket}-actual`} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Actual admitted in Lateral Entry</th>,
                        ])}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {studyYears.map((yearLabel) => (
                        <tr key={yearLabel} className="hover:bg-gray-50">
                          <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-white">{yearLabel}</td>
                          {summaryBuckets.flatMap((bucket) => [
                            <td key={`${yearLabel}-${bucket}-sanction`} className="px-3 py-3 border border-gray-300 text-center text-gray-700">
                              {threeYearSummary[bucket].sanctionByStudyYear[yearLabel] || 0}
                            </td>,
                            <td key={`${yearLabel}-${bucket}-actual`} className="px-3 py-3 border border-gray-300 text-center text-gray-700">
                              {threeYearSummary[bucket].actualByStudyYear[yearLabel] || 0}
                            </td>,
                          ])}
                        </tr>
                      ))}

                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">Sub-Total</td>
                        {summaryBuckets.flatMap((bucket) => [
                          <td key={`${bucket}-subtotal-sanction`} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">
                            {threeYearSummary[bucket].sanctionSubtotal}
                          </td>,
                          <td key={`${bucket}-subtotal-actual`} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">
                            {threeYearSummary[bucket].actualSubtotal}
                          </td>,
                        ])}
                      </tr>

                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">Total</td>
                        {summaryBuckets.map((bucket) => (
                          <td key={`${bucket}-total`} colSpan={2} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">
                            {threeYearSummary[bucket].total}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="mt-4 text-sm text-gray-600">
                  {isLoadingSummaryData
                    ? "Loading last three years data..."
                    : !selectedProgramId || !selectedAcademicYear
                      ? "Select Program and Academic Year from the top global filters."
                      : "Displaying CAY, CAYm1, and CAYm2 outside the entry form."}
                </p>

                {isAdmin() && (
                  <p className="mt-2 text-sm text-gray-600">
                    Click <span className="font-semibold text-blue-600">Student by Department</span> in the top right to open the entry form.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Table B1.1 Style Student Details</h2>
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
