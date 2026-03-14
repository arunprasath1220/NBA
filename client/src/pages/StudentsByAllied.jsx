import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  if (/^\d{4}$/.test(raw)) return Number.parseInt(raw, 10);
  return null;
};

const formatAcademicYear = (startYear) =>
  `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;

const getStudyYearValues = (rows = [], yearNumber) => {
  const row = rows.find((r) => Number(r.year_of_study) === Number(yearNumber));
  return {
    sanction: Number(row?.sanction_intake || 0),
    actual: Number(row?.actual_lateral_admitted || 0),
  };
};

const yearRows = ["2nd Year", "3rd Year", "4th Year"];
const yearNumbers = { "2nd Year": 2, "3rd Year": 3, "4th Year": 4 };

const StudentsByAllied = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { selectedAcademicYear, selectedProgramId, selectedProgramLabel, programs } = useFilterStore();

  const [isLoadingAllied, setIsLoadingAllied] = useState(false);
  const [alliedPrograms, setAlliedPrograms] = useState(null);
  const [studentDataByProgram, setStudentDataByProgram] = useState({});

  const academicYearLabels = useMemo(() => {
    const startYear = parseAcademicYearStart(selectedAcademicYear);
    if (startYear === null) return { cay: "-", caym1: "-", caym2: "-" };
    return {
      cay: formatAcademicYear(startYear),
      caym1: formatAcademicYear(startYear - 1),
      caym2: formatAcademicYear(startYear - 2),
    };
  }, [selectedAcademicYear]);

  // Derive the selected program's label the same way FacultyByAllied does
  const selectedProgramName = useMemo(() => {
    if (selectedProgramLabel) return selectedProgramLabel;
    const match = programs.find((p) => String(p.id) === String(selectedProgramId));
    return match?.coursename || "";
  }, [programs, selectedProgramId, selectedProgramLabel]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate("/login");
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchAlliedData = async () => {
      if (!selectedProgramId || !selectedAcademicYear?.trim()) {
        setAlliedPrograms(null);
        setStudentDataByProgram({});
        return;
      }

      const startYear = parseAcademicYearStart(selectedAcademicYear.trim());
      if (startYear === null) {
        setAlliedPrograms([]);
        setStudentDataByProgram({});
        return;
      }

      const cayYear = formatAcademicYear(startYear);

      setIsLoadingAllied(true);
      try {
        // Fetch mappings filtered by CAY — same approach as FacultyByAllied
        const mappingParams = new URLSearchParams({ academicYear: cayYear });
        const mappingRes = await fetch(
          `http://localhost:5000/api/allied-course/mappings?${mappingParams.toString()}`,
          { credentials: "include" },
        );
        const mappingData = await mappingRes.json();

        if (!mappingRes.ok || !mappingData.success) {
          throw new Error(mappingData.error || "Failed to fetch allied mappings");
        }

        // Mirror FacultyByAllied concept: search ALL positions in each group (main + allied),
        // not just mainProgram. Collect all OTHER programs from every matching group.
        const selectedId = Number(selectedProgramId);
        const otherProgramsMap = new Map(); // programId → program object

        (mappingData.data || []).forEach((group) => {
          const allGroupPrograms = [
            group.mainProgram,
            ...(group.alliedPrograms || []),
          ].filter(Boolean);

          const belongsToGroup = allGroupPrograms.some(
            (p) => Number(p.programId) === selectedId,
          );

          if (belongsToGroup) {
            allGroupPrograms.forEach((p) => {
              if (Number(p.programId) !== selectedId) {
                otherProgramsMap.set(Number(p.programId), p);
              }
            });
          }
        });

        const alliedList = Array.from(otherProgramsMap.values());

        if (alliedList.length === 0) {
          setAlliedPrograms([]);
          setStudentDataByProgram({});
          return;
        }

        setAlliedPrograms(alliedList);

        const requestYears = {
          cay: cayYear,
          caym1: formatAcademicYear(startYear - 1),
          caym2: formatAcademicYear(startYear - 2),
        };

        const fetchSummaryMap = async (academicYear) => {
          const params = new URLSearchParams({ academic_year: academicYear });
          const res = await fetch(
            `http://localhost:5000/api/student-by-department?${params.toString()}`,
            { credentials: "include" },
          );
          const d = await res.json();
          if (!res.ok || !d.success) throw new Error("Failed to fetch student summary");
          const map = new Map();
          (d.data?.departments || []).forEach((dept) => {
            (dept.programs || []).forEach((prog) => {
              map.set(Number(prog.program_id), prog.rows || []);
            });
          });
          return map;
        };

        const [cayMap, caym1Map, caym2Map] = await Promise.all([
          fetchSummaryMap(requestYears.cay),
          fetchSummaryMap(requestYears.caym1),
          fetchSummaryMap(requestYears.caym2),
        ]);

        const result = {};
        alliedList.forEach((p) => {
          const id = Number(p.programId);
          result[id] = {
            cay: cayMap.get(id) || [],
            caym1: caym1Map.get(id) || [],
            caym2: caym2Map.get(id) || [],
          };
        });

        setStudentDataByProgram(result);
      } catch (error) {
        console.error("Error fetching allied course student data:", error);
        setAlliedPrograms([]);
        setStudentDataByProgram({});
      } finally {
        setIsLoadingAllied(false);
      }
    };

    fetchAlliedData();
  }, [selectedProgramId, selectedAcademicYear]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const downloadExcel = () => {
    if (!alliedPrograms || alliedPrograms.length === 0) {
      alert("No allied course student data to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const rows = [];

    alliedPrograms.forEach((program) => {
      const programId = Number(program.programId);
      const windows = studentDataByProgram[programId] || {};

      yearRows.forEach((yLabel) => {
        const yn = yearNumbers[yLabel];
        const cay = getStudyYearValues(windows.cay, yn);
        const caym1 = getStudyYearValues(windows.caym1, yn);
        const caym2 = getStudyYearValues(windows.caym2, yn);
        rows.push({
          Program: program.programName,
          Department: program.departmentName || "-",
          "Year of Study": yLabel,
          [`CAY (${academicYearLabels.cay}) Sanction`]: cay.sanction,
          [`CAY (${academicYearLabels.cay}) Actual`]: cay.actual,
          [`CAYm1 (${academicYearLabels.caym1}) Sanction`]: caym1.sanction,
          [`CAYm1 (${academicYearLabels.caym1}) Actual`]: caym1.actual,
          [`CAYm2 (${academicYearLabels.caym2}) Sanction`]: caym2.sanction,
          [`CAYm2 (${academicYearLabels.caym2}) Actual`]: caym2.actual,
        });
      });
    });

    const sheet = XLSX.utils.json_to_sheet(rows);
    sheet["!cols"] = [
      { wch: 28 }, { wch: 28 }, { wch: 14 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, "Allied Students");
    XLSX.writeFile(workbook, "Student_Details_By_Allied_Dept.xlsx");
  };

  const downloadPDF = () => {
    if (!alliedPrograms || alliedPrograms.length === 0) {
      alert("No allied course student data to export.");
      return;
    }

    const doc = new jsPDF("landscape");
    let isFirstTable = true;

    alliedPrograms.forEach((program) => {
      if (!isFirstTable) doc.addPage();
      isFirstTable = false;

      const programId = Number(program.programId);
      const windows = studentDataByProgram[programId] || {};

      const yearRowsData = yearRows.map((yLabel) => {
        const yn = yearNumbers[yLabel];
        return {
          yLabel,
          cay: getStudyYearValues(windows.cay, yn),
          caym1: getStudyYearValues(windows.caym1, yn),
          caym2: getStudyYearValues(windows.caym2, yn),
        };
      });

      const caySancSub = yearRowsData.reduce((s, r) => s + r.cay.sanction, 0);
      const cayActSub = yearRowsData.reduce((s, r) => s + r.cay.actual, 0);
      const caym1SancSub = yearRowsData.reduce((s, r) => s + r.caym1.sanction, 0);
      const caym1ActSub = yearRowsData.reduce((s, r) => s + r.caym1.actual, 0);
      const caym2SancSub = yearRowsData.reduce((s, r) => s + r.caym2.sanction, 0);
      const caym2ActSub = yearRowsData.reduce((s, r) => s + r.caym2.actual, 0);

      let startY = 15;
      doc.setFontSize(12);
      doc.text(`Student Details by Allied Dept.`, 14, startY);
      doc.setFontSize(10);
      doc.text(`Selected Program: ${selectedProgramName || "-"}`, 14, startY + 6);
      doc.text(`Allied Program: ${program.programName}${program.departmentName ? ` (${program.departmentName})` : ""}`, 14, startY + 12);
      if (selectedAcademicYear) {
        doc.text(`Academic Year (CAY): ${selectedAcademicYear}`, 14, startY + 18);
        startY += 26;
      } else {
        startY += 20;
      }

      autoTable(doc, {
        head: [
          [
            { content: "Year of Study", rowSpan: 3, styles: { halign: "center", valign: "middle" } },
            { content: "CAY", colSpan: 2, styles: { halign: "center" } },
            { content: "CAYm1", colSpan: 2, styles: { halign: "center" } },
            { content: "CAYm2", colSpan: 2, styles: { halign: "center" } },
          ],
          [
            { content: academicYearLabels.cay, colSpan: 2, styles: { halign: "center" } },
            { content: academicYearLabels.caym1, colSpan: 2, styles: { halign: "center" } },
            { content: academicYearLabels.caym2, colSpan: 2, styles: { halign: "center" } },
          ],
          [
            { content: "Sanction", styles: { halign: "center" } },
            { content: "Actual", styles: { halign: "center" } },
            { content: "Sanction", styles: { halign: "center" } },
            { content: "Actual", styles: { halign: "center" } },
            { content: "Sanction", styles: { halign: "center" } },
            { content: "Actual", styles: { halign: "center" } },
          ],
        ],
        body: [
          ...yearRowsData.map((r) => [
            r.yLabel,
            r.cay.sanction, r.cay.actual,
            r.caym1.sanction, r.caym1.actual,
            r.caym2.sanction, r.caym2.actual,
          ]),
          ["Sub-Total", caySancSub, cayActSub, caym1SancSub, caym1ActSub, caym2SancSub, caym2ActSub],
          ["Total",
            { content: caySancSub + cayActSub, colSpan: 2, styles: { halign: "center" } },
            { content: caym1SancSub + caym1ActSub, colSpan: 2, styles: { halign: "center" } },
            { content: caym2SancSub + caym2ActSub, colSpan: 2, styles: { halign: "center" } }],
        ],
        startY,
        styles: { fontSize: 9, cellPadding: 2.5, lineColor: [209, 213, 219], lineWidth: 0.1 },
        headStyles: { fillColor: [254, 243, 199], textColor: [17, 24, 39], fontStyle: "bold" },
        bodyStyles: { textColor: [55, 65, 81] },
        theme: "grid",
      });
    });

    doc.save("Student_Details_By_Allied_Dept.pdf");
  };

  const renderContent = () => {
    if (!selectedProgramId) {
      return (
        <p className="text-sm text-gray-600">
          Choose a program from the global Program filter to view its allied department student details.
        </p>
      );
    }

    if (isLoadingAllied) {
      return (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          Loading allied course data...
        </div>
      );
    }

    if (!alliedPrograms || alliedPrograms.length === 0) {
      return (
        <p className="text-sm text-gray-600">
          No allied department mappings found for{" "}
          <span className="font-semibold">{selectedProgramName || "the selected program"}</span>.
        </p>
      );
    }

    return (
      <section className="w-full space-y-6">
        {alliedPrograms.map((program) => {
          const programId = Number(program.programId);
          const windows = studentDataByProgram[programId] || {};

          const rowMatrix = {};
          for (const label of yearRows) {
            const yn = yearNumbers[label];
            rowMatrix[label] = {
              cay: getStudyYearValues(windows.cay, yn),
              caym1: getStudyYearValues(windows.caym1, yn),
              caym2: getStudyYearValues(windows.caym2, yn),
            };
          }

          const caySanctionSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].cay.sanction, 0);
          const cayActualSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].cay.actual, 0);
          const caym1SanctionSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].caym1.sanction, 0);
          const caym1ActualSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].caym1.actual, 0);
          const caym2SanctionSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].caym2.sanction, 0);
          const caym2ActualSubtotal = yearRows.reduce((s, l) => s + rowMatrix[l].caym2.actual, 0);

          return (
            <div key={programId} className="overflow-x-auto rounded-lg border border-gray-300">
              <table className="min-w-[1200px] w-full text-left text-xs border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th colSpan={7} className="px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">
                      Name of the Program{" "}
                      <span className="font-bold">{program.programName}</span>
                      {program.departmentName && (
                        <span className="ml-2 font-normal text-gray-600">
                          ({program.departmentName})
                        </span>
                      )}
                    </th>
                  </tr>
                  <tr>
                    <th rowSpan={3} className="w-[140px] px-3 py-3 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900 align-middle">
                      Year of Study
                    </th>
                    <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAY</th>
                    <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAYm1</th>
                    <th colSpan={2} className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">CAYm2</th>
                  </tr>
                  <tr>
                    <th colSpan={2} className="px-3 py-3 border border-gray-300 text-center bg-white font-semibold text-gray-900">{academicYearLabels.cay}</th>
                    <th colSpan={2} className="px-3 py-3 border border-gray-300 text-center bg-white font-semibold text-gray-900">{academicYearLabels.caym1}</th>
                    <th colSpan={2} className="px-3 py-3 border border-gray-300 text-center bg-white font-semibold text-gray-900">{academicYearLabels.caym2}</th>
                  </tr>
                  <tr>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sanction Intake</th>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Actual admitted in Lateral Entry</th>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sanction Intake</th>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Actual admitted in Lateral Entry</th>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Sanction Intake</th>
                    <th className="px-3 py-2 border border-gray-300 font-semibold text-center bg-amber-100 text-gray-900">Actual admitted in Lateral Entry</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {yearRows.map((label) => (
                    <tr key={label} className="hover:bg-gray-50">
                      <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-white">{label}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].cay.sanction}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].cay.actual}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].caym1.sanction}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].caym1.actual}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].caym2.sanction}</td>
                      <td className="px-3 py-3 border border-gray-300 text-center text-gray-700">{rowMatrix[label].caym2.actual}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">Sub-Total</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{caySanctionSubtotal}</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{cayActualSubtotal}</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{caym1SanctionSubtotal}</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{caym1ActualSubtotal}</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{caym2SanctionSubtotal}</td>
                    <td className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-50">{caym2ActualSubtotal}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3 border border-gray-300 font-semibold text-gray-900 bg-amber-50">Total</td>
                    <td colSpan={2} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">{caySanctionSubtotal + cayActualSubtotal}</td>
                    <td colSpan={2} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">{caym1SanctionSubtotal + caym1ActualSubtotal}</td>
                    <td colSpan={2} className="px-3 py-3 border border-gray-300 text-center font-semibold text-gray-800 bg-gray-100">{caym2SanctionSubtotal + caym2ActualSubtotal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })}
      </section>
    );
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-xl font-semibold text-gray-800">Student Details by Allied Dept.</h1>
              {alliedPrograms && alliedPrograms.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={downloadExcel}
                    className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={downloadPDF}
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
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentsByAllied;
