import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

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

const formatAcademicYear = (startYear) =>
  `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const toDateOrNull = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isProfessorDesignation = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("professor") && !text.includes("associate") && !text.includes("assistant");
};

const isAssociateDesignation = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("associate") && text.includes("professor");
};

const isAssistantDesignation = (designation) => {
  const text = String(designation || "").toLowerCase();
  return text.includes("assistant") && text.includes("professor");
};

const resolveDesignationBucket = (designation) => {
  if (isProfessorDesignation(designation)) return "Professor";
  if (isAssociateDesignation(designation)) return "Associate Professor";
  if (isAssistantDesignation(designation)) return "Assistant Professor";
  return null;
};

const resolveDesignationForWindow = (facultyRow, windowStartDate) => {
  const presentBucket = resolveDesignationBucket(facultyRow.present_designation);
  if (presentBucket !== "Professor") {
    return presentBucket;
  }

  const promotedAsProf = toDateOrNull(facultyRow.date_designated_as_prof);
  if (promotedAsProf && promotedAsProf > windowStartDate) {
    return resolveDesignationBucket(facultyRow.designation_at_joining);
  }

  return "Professor";
};

const countFacultyForWindow = (rows, windowStartDate, windowEndDate) =>
  rows.reduce((count, row) => {
    const joiningDate = toDateOrNull(row.date_of_joining);
    if (!joiningDate || joiningDate > windowStartDate) {
      return count;
    }

    const leavingDate = toDateOrNull(row.date_of_leaving);
    if (leavingDate && leavingDate <= windowEndDate) {
      return count;
    }

    const designation = resolveDesignationForWindow(row, windowStartDate);
    if (!designation) {
      return count;
    }

    return count + 1;
  }, 0);

const getTotalStudentsFromProgramRows = (programRows = []) =>
  (programRows || []).reduce(
    (sum, row) => sum + Number(row.sanction_intake || 0) + Number(row.actual_lateral_admitted || 0),
    0,
  );

const getProgramRowsMap = (departments = []) => {
  const result = new Map();
  (departments || []).forEach((department) => {
    (department.programs || []).forEach((program) => {
      result.set(Number(program.program_id), program.rows || []);
    });
  });
  return result;
};

const RatioByDepartment = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { selectedAcademicYear, selectedProgramId, programs } = useFilterStore();

  const [tableData, setTableData] = useState(null);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState("");
  const [ffInputs, setFfInputs] = useState({
    CAY: "",
    CAYm1: "",
    CAYm2: "",
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const academicYearLabels = useMemo(() => {
    const startYear = parseAcademicYearStart(selectedAcademicYear);
    if (startYear === null) {
      return { CAY: "-", CAYm1: "-", CAYm2: "-", startYear: null };
    }

    return {
      CAY: formatAcademicYear(startYear),
      CAYm1: formatAcademicYear(startYear - 1),
      CAYm2: formatAcademicYear(startYear - 2),
      startYear,
    };
  }, [selectedAcademicYear]);

  const selectedProgramRecord = useMemo(
    () => programs.find((program) => String(program.id) === String(selectedProgramId)),
    [programs, selectedProgramId],
  );

  const effectiveFacultyProgramId = selectedProgramRecord?.programNameId
    ? String(selectedProgramRecord.programNameId)
    : "";

  useEffect(() => {
    const fetchTableData = async () => {
      if (!selectedProgramId || !academicYearLabels.startYear) {
        setTableData(null);
        setTableError("");
        return;
      }

      setIsLoadingTable(true);
      setTableError("");

      try {
        const requestYears = {
          CAY: academicYearLabels.CAY,
          CAYm1: academicYearLabels.CAYm1,
          CAYm2: academicYearLabels.CAYm2,
        };

        let facultyProgramIdentifier = effectiveFacultyProgramId;
        if (!facultyProgramIdentifier) {
          const coursesResponse = await fetch("http://localhost:5000/api/institute/courses", {
            credentials: "include",
          });
          const coursesData = await coursesResponse.json();

          if (!coursesResponse.ok || !coursesData.success) {
            throw new Error(coursesData.error || "Failed to resolve program mapping");
          }

          const matchedCourse = (coursesData.data || []).find(
            (course) => String(course.id) === String(selectedProgramId),
          );

          facultyProgramIdentifier = matchedCourse?.programNameId
            ? String(matchedCourse.programNameId)
            : "";
        }

        if (!facultyProgramIdentifier) {
          throw new Error("Unable to resolve selected program for faculty stats");
        }

        const fetchStudentSummaryByYear = async (yearLabel) => {
          const params = new URLSearchParams({ academic_year: yearLabel });
          const response = await fetch(`http://localhost:5000/api/student-by-department?${params.toString()}`, {
            credentials: "include",
          });
          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || "Failed to fetch student summary");
          }
          return data.data?.departments || [];
        };

        const [departmentsCAY, departmentsCAYm1, departmentsCAYm2] = await Promise.all([
          fetchStudentSummaryByYear(requestYears.CAY),
          fetchStudentSummaryByYear(requestYears.CAYm1),
          fetchStudentSummaryByYear(requestYears.CAYm2),
        ]);

        const mappingParams = new URLSearchParams({ academicYear: requestYears.CAY });
        const mappingResponse = await fetch(
          `http://localhost:5000/api/allied-course/mappings?${mappingParams.toString()}`,
          { credentials: "include" },
        );
        const mappingData = await mappingResponse.json();
        if (!mappingResponse.ok || !mappingData.success) {
          throw new Error(mappingData.error || "Failed to fetch allied mappings");
        }

        const facultyStatsParams = new URLSearchParams({
          program_id: facultyProgramIdentifier,
          academicYear: requestYears.CAY,
        });
        const facultyStatsResponse = await fetch(
          `http://localhost:5000/api/faculty/stats/designation?${facultyStatsParams.toString()}`,
          { credentials: "include" },
        );
        const facultyStatsData = await facultyStatsResponse.json();
        if (!facultyStatsResponse.ok || !facultyStatsData.success) {
          throw new Error(facultyStatsData.error || "Failed to fetch faculty stats");
        }

        const facultyListResponse = await fetch("http://localhost:5000/api/faculty", {
          credentials: "include",
        });
        const facultyListData = await facultyListResponse.json();
        if (!facultyListResponse.ok || !facultyListData.success) {
          throw new Error(facultyListData.error || "Failed to fetch faculty list");
        }

        const selectedProgramNumericId = Number(selectedProgramId);
        const studentRowsByWindow = {
          CAY: getProgramRowsMap(departmentsCAY),
          CAYm1: getProgramRowsMap(departmentsCAYm1),
          CAYm2: getProgramRowsMap(departmentsCAYm2),
        };

        const alliedProgramIds = new Set();
        const alliedDepartmentNames = new Set();
        (mappingData.data || []).forEach((group) => {
          const groupPrograms = [group.mainProgram, ...(group.alliedPrograms || [])].filter(Boolean);
          const belongsToGroup = groupPrograms.some((p) => Number(p.programId) === selectedProgramNumericId);

          if (!belongsToGroup) return;

          groupPrograms.forEach((program) => {
            const programId = Number(program.programId);
            const departmentName = String(program.departmentName || "").trim();

            if (programId !== selectedProgramNumericId) {
              alliedProgramIds.add(programId);
            }
            if (departmentName) {
              alliedDepartmentNames.add(departmentName.toLowerCase());
            }
          });
        });

        const selectedDepartmentName = String(selectedProgramRecord?.departmentName || "").trim().toLowerCase();
        if (selectedDepartmentName) {
          alliedDepartmentNames.delete(selectedDepartmentName);
        }

        const dsByWindow = {
          CAY: getTotalStudentsFromProgramRows(studentRowsByWindow.CAY.get(selectedProgramNumericId) || []),
          CAYm1: getTotalStudentsFromProgramRows(studentRowsByWindow.CAYm1.get(selectedProgramNumericId) || []),
          CAYm2: getTotalStudentsFromProgramRows(studentRowsByWindow.CAYm2.get(selectedProgramNumericId) || []),
        };

        const asByWindow = {
          CAY: 0,
          CAYm1: 0,
          CAYm2: 0,
        };

        alliedProgramIds.forEach((programId) => {
          asByWindow.CAY += getTotalStudentsFromProgramRows(studentRowsByWindow.CAY.get(programId) || []);
          asByWindow.CAYm1 += getTotalStudentsFromProgramRows(studentRowsByWindow.CAYm1.get(programId) || []);
          asByWindow.CAYm2 += getTotalStudentsFromProgramRows(studentRowsByWindow.CAYm2.get(programId) || []);
        });

        const sByWindow = {
          CAY: dsByWindow.CAY + asByWindow.CAY,
          CAYm1: dsByWindow.CAYm1 + asByWindow.CAYm1,
          CAYm2: dsByWindow.CAYm2 + asByWindow.CAYm2,
        };

        const designationRows = facultyStatsData.data?.rows || [];
        const designationsToCount = ["Professor", "Associate Professor", "Assistant Professor"];
        const dfByWindow = {
          CAY: designationRows
            .filter((row) => designationsToCount.includes(row.designation))
            .reduce((sum, row) => sum + Number(row.CAY?.total || 0), 0),
          CAYm1: designationRows
            .filter((row) => designationsToCount.includes(row.designation))
            .reduce((sum, row) => sum + Number(row.CAYm1?.total || 0), 0),
          CAYm2: designationRows
            .filter((row) => designationsToCount.includes(row.designation))
            .reduce((sum, row) => sum + Number(row.CAYm2?.total || 0), 0),
        };

        const alliedFacultyRows = (facultyListData.data || []).filter((row) => {
          const departmentText = String(row.department_name || row.program_coursename || "")
            .trim()
            .toLowerCase();
          return departmentText && alliedDepartmentNames.has(departmentText);
        });

        const windowDates = {
          CAY: {
            start: new Date(`${academicYearLabels.startYear}-08-31T00:00:00`),
            end: new Date(`${academicYearLabels.startYear + 1}-04-25T00:00:00`),
          },
          CAYm1: {
            start: new Date(`${academicYearLabels.startYear - 1}-08-31T00:00:00`),
            end: new Date(`${academicYearLabels.startYear}-04-25T00:00:00`),
          },
          CAYm2: {
            start: new Date(`${academicYearLabels.startYear - 2}-08-31T00:00:00`),
            end: new Date(`${academicYearLabels.startYear - 1}-04-25T00:00:00`),
          },
        };

        const afByWindow = {
          CAY: countFacultyForWindow(alliedFacultyRows, windowDates.CAY.start, windowDates.CAY.end),
          CAYm1: countFacultyForWindow(alliedFacultyRows, windowDates.CAYm1.start, windowDates.CAYm1.end),
          CAYm2: countFacultyForWindow(alliedFacultyRows, windowDates.CAYm2.start, windowDates.CAYm2.end),
        };

        const fByWindow = {
          CAY: dfByWindow.CAY + afByWindow.CAY,
          CAYm1: dfByWindow.CAYm1 + afByWindow.CAYm1,
          CAYm2: dfByWindow.CAYm2 + afByWindow.CAYm2,
        };

        setTableData({
          labels: {
            CAY: requestYears.CAY,
            CAYm1: requestYears.CAYm1,
            CAYm2: requestYears.CAYm2,
          },
          DS: dsByWindow,
          AS: asByWindow,
          S: sByWindow,
          DF: dfByWindow,
          AF: afByWindow,
          F: fByWindow,
        });
      } catch (error) {
        console.error("Error building ratio by department table:", error);
        setTableData(null);
        setTableError(error.message || "Failed to load ratio data");
      } finally {
        setIsLoadingTable(false);
      }
    };

    fetchTableData();
  }, [
    academicYearLabels.CAY,
    academicYearLabels.CAYm1,
    academicYearLabels.CAYm2,
    academicYearLabels.startYear,
    effectiveFacultyProgramId,
    selectedProgramId,
    selectedProgramRecord?.programNameId,
    selectedProgramRecord?.departmentName,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const toNonNegativeNumber = (value) => {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return parsed;
  };

  const ffByWindow = {
    CAY: toNonNegativeNumber(ffInputs.CAY),
    CAYm1: toNonNegativeNumber(ffInputs.CAYm1),
    CAYm2: toNonNegativeNumber(ffInputs.CAYm2),
  };

  const sfrByWindow = tableData
    ? {
        CAY:
          tableData.F.CAY - ffByWindow.CAY > 0
            ? tableData.S.CAY / (tableData.F.CAY - ffByWindow.CAY)
            : null,
        CAYm1:
          tableData.F.CAYm1 - ffByWindow.CAYm1 > 0
            ? tableData.S.CAYm1 / (tableData.F.CAYm1 - ffByWindow.CAYm1)
            : null,
        CAYm2:
          tableData.F.CAYm2 - ffByWindow.CAYm2 > 0
            ? tableData.S.CAYm2 / (tableData.F.CAYm2 - ffByWindow.CAYm2)
            : null,
      }
    : { CAY: null, CAYm1: null, CAYm2: null };

  const averageSfr = (() => {
    const values = [sfrByWindow.CAY, sfrByWindow.CAYm1, sfrByWindow.CAYm2].filter(
      (value) => value !== null,
    );
    if (values.length !== 3) return null;
    return values.reduce((sum, value) => sum + value, 0) / 3;
  })();

  const renderNumberCell = (value) => <span className="font-semibold text-gray-900">{value}</span>;

  const renderSfrCell = (value) => (value === null ? "-" : value.toFixed(2));

  const handleFfChange = (key, value) => {
    if (value !== "" && !/^\d*(\.\d*)?$/.test(value)) {
      return;
    }
    setFfInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Faculty Student Ratio by Dept.</h1>
            </div>

            <div className="overflow-x-auto">
              {!selectedProgramId || !selectedAcademicYear ? (
                <p className="text-sm text-gray-600">
                  Select both Academic Year and Program from the top filter to view the ratio table.
                </p>
              ) : isLoadingTable ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  Loading ratio data...
                </div>
              ) : tableError ? (
                <p className="text-sm text-red-600">{tableError}</p>
              ) : !tableData ? (
                <p className="text-sm text-gray-600">No data available.</p>
              ) : (
                <table className="min-w-[980px] w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-amber-100 text-gray-900">
                      <th className="border border-gray-300 p-3 text-left font-semibold w-[42%]">Description</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">CAY</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">CAYm1</th>
                      <th className="border border-gray-300 p-3 text-center font-semibold">CAYm2</th>
                    </tr>
                    <tr className="bg-amber-100 text-gray-900">
                      <th className="border border-gray-300 p-2"></th>
                      <th className="border border-gray-300 p-2 text-center font-medium">{tableData.labels.CAY}</th>
                      <th className="border border-gray-300 p-2 text-center font-medium">{tableData.labels.CAYm1}</th>
                      <th className="border border-gray-300 p-2 text-center font-medium">{tableData.labels.CAYm2}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Total no. of Students in all UG and PG programs in the Department (DS)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DS.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DS.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DS.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Total no. of Students of all UG and PG programs in Allied Departments (AS)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AS.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AS.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AS.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Total no. of Students (S) in the Department (DS) and Allied Departments (AS)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.S.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.S.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.S.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Total no. of Faculty members in the Department (DF)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DF.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DF.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.DF.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Total no. of Faculty members in the Allied Departments (AF)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AF.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AF.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.AF.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Total no. of Faculty members (F) in the Department (DF) and Allied Departments (AF)</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.F.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.F.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center">{renderNumberCell(tableData.F.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">The Faculty members in F who have a 100% teaching load in the first year courses (FF)</td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={ffInputs.CAY}
                          onChange={(event) => handleFfChange("CAY", event.target.value)}
                          className="w-24 h-9 px-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={ffInputs.CAYm1}
                          onChange={(event) => handleFfChange("CAYm1", event.target.value)}
                          className="w-24 h-9 px-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={ffInputs.CAYm2}
                          onChange={(event) => handleFfChange("CAYm2", event.target.value)}
                          className="w-24 h-9 px-2 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Student Faculty Ratio (SFR) = S / (F - FF)</td>
                      <td className="border border-gray-300 p-3 text-center font-semibold text-gray-900">{renderSfrCell(sfrByWindow.CAY)}</td>
                      <td className="border border-gray-300 p-3 text-center font-semibold text-gray-900">{renderSfrCell(sfrByWindow.CAYm1)}</td>
                      <td className="border border-gray-300 p-3 text-center font-semibold text-gray-900">{renderSfrCell(sfrByWindow.CAYm2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Average SFR for 3 years</td>
                      <td colSpan={3} className="border border-gray-300 p-3 text-center font-semibold text-gray-900">
                        {averageSfr === null ? "-" : averageSfr.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RatioByDepartment;
