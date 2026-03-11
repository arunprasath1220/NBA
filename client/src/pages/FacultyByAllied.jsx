import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const designationRowOrder = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Number of Ph.D",
];

const parseAcademicYearLabel = (label) => {
  if (!label || !/^\d{4}-\d{2}$/.test(label)) return null;
  const startYear = Number.parseInt(label.slice(0, 4), 10);
  const endYearTwoDigits = Number.parseInt(label.slice(5, 7), 10);
  if ((startYear + 1) % 100 !== endYearTwoDigits) return null;
  return startYear;
};

const toDateOrNullValue = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildAcademicWindow = (startYear) => ({
  label: `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`,
  windowStart: new Date(`${startYear}-08-31T00:00:00`),
  windowEnd: new Date(`${startYear + 1}-04-25T00:00:00`),
});

const toAssociationBucket = (association) =>
  String(association || "").trim().toLowerCase() === "contract" ? "contract" : "regular";

const isProfessor = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("professor") && !text.includes("associate") && !text.includes("assistant");
};

const isAssociate = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("associate") && text.includes("professor");
};

const isAssistant = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("assistant") && text.includes("professor");
};

const resolveDesignation = (designation) => {
  if (isProfessor(designation)) return "Professor";
  if (isAssociate(designation)) return "Associate Professor";
  if (isAssistant(designation)) return "Assistant Professor";
  return null;
};

const isPhdDegree = (degree) => /ph\s*\.?\s*d/i.test(String(degree || ""));

const emptyStats = () => ({
  Professor: { regular: 0, contract: 0 },
  "Associate Professor": { regular: 0, contract: 0 },
  "Assistant Professor": { regular: 0, contract: 0 },
  "Number of Ph.D": { regular: 0, contract: 0 },
});

const toCell = ({ regular, contract }) => ({
  regular,
  contract,
  total: regular + contract,
  display: `${regular}(R) + ${contract}(C)`,
});

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const computeStats = (rows, academicYearLabel) => {
  const startYear = parseAcademicYearLabel(academicYearLabel);
  if (!startYear) return null;

  const windows = [
    { key: "CAY", ...buildAcademicWindow(startYear) },
    { key: "CAYm1", ...buildAcademicWindow(startYear - 1) },
    { key: "CAYm2", ...buildAcademicWindow(startYear - 2) },
  ];

  const statsByWindow = {
    CAY: emptyStats(),
    CAYm1: emptyStats(),
    CAYm2: emptyStats(),
  };

  for (const window of windows) {
    for (const row of rows) {
      const joinDate = toDateOrNullValue(row.date_of_joining);
      if (!joinDate || joinDate > window.windowStart) continue;

      const leaveDate = toDateOrNullValue(row.date_of_leaving);
      if (leaveDate && leaveDate <= window.windowEnd) continue;

      let designation = resolveDesignation(row.present_designation);
      if (designation === "Professor") {
        const promotedDate = toDateOrNullValue(row.date_designated_as_prof);
        if (promotedDate && promotedDate > window.windowStart) {
          designation = resolveDesignation(row.designation_at_joining);
        }
      }

      if (!designation) continue;

      const association = toAssociationBucket(row.nature_of_association);
      statsByWindow[window.key][designation][association] += 1;
      if (isPhdDegree(row.highest_degree)) {
        statsByWindow[window.key]["Number of Ph.D"][association] += 1;
      }
    }
  }

  return {
    labels: {
      CAY: windows[0].label,
      CAYm1: windows[1].label,
      CAYm2: windows[2].label,
    },
    rows: designationRowOrder.map((designation) => ({
      designation,
      CAY: toCell(statsByWindow.CAY[designation]),
      CAYm1: toCell(statsByWindow.CAYm1[designation]),
      CAYm2: toCell(statsByWindow.CAYm2[designation]),
    })),
  };
};

const FacultyByAllied = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const { selectedAcademicYear, selectedProgramId, selectedProgramLabel, programs } = useFilterStore();
  const [mappings, setMappings] = useState([]);
  const [facultyRows, setFacultyRows] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      setLoadingData(true);
      setError("");
      try {
        const mappingResp = await axios.get("http://localhost:5000/api/allied-course/mappings", {
          params: selectedAcademicYear ? { academicYear: selectedAcademicYear } : {},
          withCredentials: true,
        });

        const facultyResp = await axios.get("http://localhost:5000/api/faculty", {
          withCredentials: true,
        });

        const mappingData = mappingResp.data?.success ? mappingResp.data.data || [] : [];
        const facultyData = facultyResp.data?.success ? facultyResp.data.data || [] : [];

        setMappings(mappingData);
        setFacultyRows(facultyData);
      } catch (err) {
        console.error("Error loading allied faculty data:", err);
        setError("Failed to load allied faculty data");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated, selectedAcademicYear]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedDepartment = useMemo(() => {
    if (selectedProgramLabel) return selectedProgramLabel;
    const match = programs.find((program) => String(program.id) === String(selectedProgramId));
    return match?.coursename || "";
  }, [programs, selectedProgramId, selectedProgramLabel]);

  const alliedDepartmentNames = useMemo(() => {
    if (!selectedDepartment) return [];
    const selectedKey = normalizeText(selectedDepartment);
    const unique = new Set();

    mappings.forEach((mapping) => {
      const groupDepartments = [
        mapping?.mainProgram?.departmentName,
        ...(mapping?.alliedPrograms || []).map((program) => program?.departmentName),
      ]
        .filter(Boolean)
        .map((name) => String(name).trim());

      const belongsToGroup = groupDepartments.some(
        (name) => normalizeText(name) === selectedKey,
      );

      if (belongsToGroup) {
        groupDepartments.forEach((name) => unique.add(name));
      }
    });

    if (unique.size === 0) {
      unique.add(selectedDepartment);
    }

    return Array.from(unique);
  }, [mappings, selectedDepartment]);

  const groupedFaculty = useMemo(() => {
    const grouped = {};
    alliedDepartmentNames.forEach((departmentName) => {
      const targetDepartment = normalizeText(departmentName);
      grouped[departmentName] = facultyRows.filter(
        (row) => normalizeText(row.department_name || row.program_coursename) === targetDepartment,
      );
    });
    return grouped;
  }, [alliedDepartmentNames, facultyRows]);

  const renderCalculationTable = (statsData) => (
    <div className="mt-3 hidden md:block w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[900px] w-full text-left text-xs border-collapse border border-gray-300">
        <thead>
          <tr className="bg-amber-100 text-gray-900">
            <th rowSpan={2} className="px-3 py-3 border border-gray-300 font-semibold text-center">Designation</th>
            <th colSpan={3} className="px-3 py-3 border border-gray-300 font-semibold text-center">Number of faculty in the department for both UG and PG</th>
          </tr>
          <tr className="bg-amber-100 text-gray-900">
            <th className="px-3 py-2 border border-gray-300 font-semibold text-center">CAY<div className="text-[11px] font-medium">{statsData?.labels?.CAY || "-"}</div></th>
            <th className="px-3 py-2 border border-gray-300 font-semibold text-center">CAYm1<div className="text-[11px] font-medium">{statsData?.labels?.CAYm1 || "-"}</div></th>
            <th className="px-3 py-2 border border-gray-300 font-semibold text-center">CAYm2<div className="text-[11px] font-medium">{statsData?.labels?.CAYm2 || "-"}</div></th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {designationRowOrder.map((designation) => {
            const row = statsData?.rows?.find((item) => item.designation === designation);
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
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Faculty by Allied Dept.</h1>
            </div>

            {loadingData ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-600">Loading allied departments...</div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-red-600">{error}</div>
            ) : !selectedProgramId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-600">
                Choose a department from the global Program filter to view all of its allied departments.
              </div>
            ) : (
              <div className="space-y-4">
                {alliedDepartmentNames.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
                    No allied department mappings found for {selectedDepartment || "the selected department"}.
                  </div>
                ) : (
                  alliedDepartmentNames.map((departmentName) => {
                    const rows = groupedFaculty[departmentName] || [];
                    const stats = computeStats(rows, selectedAcademicYear);
                    return (
                      <div key={departmentName} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-2">{departmentName}</h3>
                        {rows.length === 0 ? (
                          <div className="text-sm text-gray-500">No faculty records found for this department.</div>
                        ) : (
                          <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-[1200px] w-full text-left text-xs border-collapse border border-gray-300">
                              <thead>
                                <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                                  <th className="px-2 py-2 border border-gray-300">S.No</th>
                                  <th className="px-2 py-2 border border-gray-300">Faculty Name</th>
                                  <th className="px-2 py-2 border border-gray-300">Highest Degree</th>
                                  <th className="px-2 py-2 border border-gray-300">Present Designation</th>
                                  <th className="px-2 py-2 border border-gray-300">Working</th>
                                  <th className="px-2 py-2 border border-gray-300">Experience</th>
                                </tr>
                              </thead>
                              <tbody>
                                {rows.map((row, index) => (
                                  <tr key={`${departmentName}-${row.id}-${index}`} className="hover:bg-blue-50">
                                    <td className="px-2 py-2 border border-gray-300 text-center">{index + 1}</td>
                                    <td className="px-2 py-2 border border-gray-300">{row.faculty_name || "-"}</td>
                                    <td className="px-2 py-2 border border-gray-300">{row.highest_degree || "-"}</td>
                                    <td className="px-2 py-2 border border-gray-300">{row.present_designation || "-"}</td>
                                    <td className="px-2 py-2 border border-gray-300">{row.working_presently || "-"}</td>
                                    <td className="px-2 py-2 border border-gray-300">{row.experience_years || "-"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {!selectedAcademicYear ? (
                          <div className="mt-3 text-sm text-gray-500">Select academic year to view calculation table.</div>
                        ) : (
                          renderCalculationTable(stats)
                        )}
                      </div>
                    );
                  })
                )}
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default FacultyByAllied;
