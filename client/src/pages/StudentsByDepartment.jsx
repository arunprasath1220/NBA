import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const studyYears = ["2nd Year", "3rd Year", "4th Year"];
const columnOrder = ["cay", "caym1", "caym2"];

const formatAcademicYear = (startYear) => `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const buildYearMetadata = (value, offset = 0) => {
  const trimmedValue = String(value || "").trim();
  if (!trimmedValue) {
    return { display: "", lookupValues: [] };
  }

  if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
    const startYear = Number.parseInt(trimmedValue.slice(0, 4), 10) - offset;
    return {
      display: formatAcademicYear(startYear),
      lookupValues: [formatAcademicYear(startYear), String(startYear)],
    };
  }

  if (/^\d{4}$/.test(trimmedValue)) {
    const startYear = Number.parseInt(trimmedValue, 10) - offset;
    return {
      display: String(startYear),
      lookupValues: [String(startYear), formatAcademicYear(startYear)],
    };
  }

  return {
    display: offset === 0 ? trimmedValue : "",
    lookupValues: offset === 0 ? [trimmedValue] : [],
  };
};

const StudentsByDepartment = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();

  const [showForm, setShowForm] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [intakeEntries, setIntakeEntries] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [cayValue, setCayValue] = useState("");
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [isLoadingIntake, setIsLoadingIntake] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [actualAdmissions, setActualAdmissions] = useState({
    "2nd Year": { cay: "", caym1: "", caym2: "" },
    "3rd Year": { cay: "", caym1: "", caym2: "" },
    "4th Year": { cay: "", caym1: "", caym2: "" },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchPrograms = async () => {
      setIsLoadingPrograms(true);
      try {
        const response = await fetch("http://localhost:5000/api/institute/courses", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setPrograms(data.data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setIsLoadingPrograms(false);
      }
    };

    const fetchIntakeEntries = async () => {
      setIsLoadingIntake(true);
      try {
        const response = await fetch("http://localhost:5000/api/intake", {
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setIntakeEntries(data.data);
        }
      } catch (error) {
        console.error("Error fetching intake entries:", error);
      } finally {
        setIsLoadingIntake(false);
      }
    };

    fetchPrograms();
    fetchIntakeEntries();
  }, [isAuthenticated]);

  const programOptions = useMemo(
    () =>
      programs
        .filter((program) => program?.id != null)
        .map((program) => ({
          id: String(program.id),
          label: program.programName || program.departmentName || `Program ${program.id}`,
        })),
    [programs],
  );

  const selectedProgramLabel = useMemo(
    () => programOptions.find((program) => program.id === selectedProgramId)?.label || "<Selected Program>",
    [programOptions, selectedProgramId],
  );

  const yearColumns = useMemo(
    () => [
      { key: "cay", label: "CAY", ...buildYearMetadata(cayValue, 0) },
      { key: "caym1", label: "CAYm1", ...buildYearMetadata(cayValue, 1) },
      { key: "caym2", label: "CAYm2", ...buildYearMetadata(cayValue, 2) },
    ],
    [cayValue],
  );

  const sanctionedIntakeByColumn = useMemo(() => {
    const result = { cay: 0, caym1: 0, caym2: 0 };

    if (!selectedProgramId) {
      return result;
    }

    const programEntries = intakeEntries.filter(
      (entry) => String(entry.program_id) === String(selectedProgramId),
    );

    yearColumns.forEach((column) => {
      const matchingEntries = programEntries.filter((entry) =>
        column.lookupValues.includes(String(entry.academic_year || "").trim()),
      );

      result[column.key] = matchingEntries.reduce(
        (sum, entry) => sum + (Number.parseInt(entry.current_intake, 10) || 0),
        0,
      );
    });

    return result;
  }, [intakeEntries, selectedProgramId, yearColumns]);

  const subtotalByColumn = useMemo(
    () =>
      columnOrder.reduce((acc, columnKey) => {
        const actualSubtotal = studyYears.reduce(
          (sum, yearLabel) => sum + (Number.parseInt(actualAdmissions[yearLabel][columnKey], 10) || 0),
          0,
        );
        const sanctionValue = sanctionedIntakeByColumn[columnKey] || 0;

        acc[columnKey] = {
          sanction: sanctionValue * studyYears.length,
          actual: actualSubtotal,
          total: sanctionValue * studyYears.length + actualSubtotal,
        };
        return acc;
      }, {}),
    [actualAdmissions, sanctionedIntakeByColumn],
  );

  const handleActualAdmissionChange = (yearLabel, columnKey, value) => {
    if (value !== "" && !/^\d+$/.test(value)) {
      return;
    }

    setActualAdmissions((prev) => ({
      ...prev,
      [yearLabel]: {
        ...prev[yearLabel],
        [columnKey]: value,
      },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedProgramId) {
      setSubmitStatus({ type: "error", message: "Please select a program before submitting." });
      return;
    }

    if (!cayValue.trim()) {
      setSubmitStatus({ type: "error", message: "Please enter the CAY year before submitting." });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

    try {
      setSubmitStatus({
        type: "success",
        message: "Student by department form is ready. Submit API wiring can be added next.",
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-600">
                  {isAdmin()
                    ? <><span>Click </span><span className="font-semibold text-blue-600">Student by Department</span><span> in the top right to open the form table.</span></>
                    : "Student details by department will be displayed here."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 overflow-hidden">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Table B1.1 Style Student Details</h2>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-300">
                  <table className="min-w-[980px] w-full text-left text-xs border-collapse border border-gray-300">
                    <thead>
                      <tr>
                        <th
                          colSpan={7}
                          className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900"
                        >
                          Name of the Program{" "}
                          <select
                            value={selectedProgramId}
                            onChange={(event) => setSelectedProgramId(event.target.value)}
                            className="inline-block min-w-[260px] rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 outline-none focus:border-blue-500"
                          >
                            <option value="">Select Program</option>
                            {programOptions.map((program) => (
                              <option key={program.id} value={program.id}>
                                {program.label}
                              </option>
                            ))}
                          </select>
                        </th>
                      </tr>
                      <tr>
                        <th
                          rowSpan={3}
                          className="w-[140px] px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900 align-top"
                        >
                          Year of Study
                        </th>
                        {yearColumns.map((column) => (
                          <th
                            key={column.key}
                            colSpan={2}
                            className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {yearColumns.map((column) => (
                          <th
                            key={`${column.key}-display`}
                            colSpan={2}
                            className="px-3 py-3 border border-gray-300 text-center bg-white"
                          >
                            {column.key === "cay" ? (
                              <input
                                type="text"
                                value={cayValue}
                                onChange={(event) => setCayValue(event.target.value)}
                                placeholder="Mention the year"
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center font-semibold text-gray-900 outline-none ring-0 focus:border-blue-500"
                              />
                            ) : (
                              <div className="font-semibold text-gray-900">
                                {column.display || "Auto calculated"}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                      <tr>
                        {yearColumns.flatMap((column) => [
                          <th
                            key={`${column.key}-sanction`}
                            className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900"
                          >
                            Sanction Intake
                          </th>,
                          <th
                            key={`${column.key}-actual`}
                            className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900"
                          >
                            Actual admitted in Lateral Entry
                          </th>,
                        ])}
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {studyYears.map((yearLabel) => (
                        <tr key={yearLabel} className="hover:bg-gray-50">
                          <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-white">
                            {yearLabel}
                          </td>
                          {columnOrder.flatMap((columnKey) => {
                            const sanctionValue = selectedProgramId ? sanctionedIntakeByColumn[columnKey] || 0 : "";
                            return [
                              <td
                                key={`${yearLabel}-${columnKey}-sanction`}
                                className="px-3 py-3 border border-gray-300 text-center text-gray-700"
                              >
                                {selectedProgramId ? sanctionValue : "-"}
                              </td>,
                              <td
                                key={`${yearLabel}-${columnKey}-actual`}
                                className="px-3 py-2 border border-gray-300 text-center"
                              >
                                <input
                                  type="text"
                                  value={actualAdmissions[yearLabel][columnKey]}
                                  onChange={(event) =>
                                    handleActualAdmissionChange(yearLabel, columnKey, event.target.value)
                                  }
                                  placeholder="0"
                                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-center outline-none focus:border-blue-500"
                                />
                              </td>,
                            ];
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">
                          Sub-Total
                        </td>
                        {columnOrder.flatMap((columnKey) => [
                          <td
                            key={`${columnKey}-subtotal-sanction`}
                            className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50"
                          >
                            {subtotalByColumn[columnKey].sanction}
                          </td>,
                          <td
                            key={`${columnKey}-subtotal-actual`}
                            className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50"
                          >
                            {subtotalByColumn[columnKey].actual}
                          </td>,
                        ])}
                      </tr>
                      <tr>
                        <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">
                          Total
                        </td>
                        {columnOrder.map((columnKey) => (
                          <td
                            key={`${columnKey}-total`}
                            colSpan={2}
                            className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100"
                          >
                            {subtotalByColumn[columnKey].total}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Selected Program: <span className="font-semibold text-gray-800">{selectedProgramLabel}</span>
                  </p>
                  <p>
                    {isLoadingPrograms || isLoadingIntake
                      ? "Loading program and intake details..."
                      : "Sanction intake values are read-only and pulled from the existing intake data."}
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
