import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";

const API_URL = "http://localhost:5000/api";
const TopBar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  // Get page name from path
  const getPageName = () => {
    const pathMap = {
      "/institute-profile": "Institute Profile",
      "/all-programs": "All Programs",
      "/allied-mapping": "Allied Course Mapping",
      "/students-intake": "Students Intake",
      "/faculty-department": "Faculty by Department",
      "/faculty-allied": "Faculty by Allied Dept.",
      "/ratio-department": "Faculty Student Ratio by Dept.",
      "/ratio-allied": "Faculty Student Ratio by Allied",
    };
    return pathMap[location.pathname] || "Dashboard";
  };

  const role = isAdmin() ? "Admin" : "User";

  const {
    academicYearOptions,
    selectedAcademicYear,
    selectedProgramId,
    programs,
    setPrograms,
    setSelectedAcademicYear,
    setSelectedProgram,
    clearProgramSelection,
  } = useFilterStore();

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API_URL}/institute/courses`, {
          credentials: "include",
        });
        const data = await response.json();

        if (data.success && data.data) {
          const normalized = data.data.map((program) => ({
            ...program,
            coursename: program.programName || program.departmentName || "",
          }));
          setPrograms(normalized);
        }
      } catch (error) {
        console.error("Error fetching programs for top bar filters:", error);
      }
    };

    fetchPrograms();
  }, [setPrograms]);

  const handleProgramChange = (e) => {
    const programId = e.target.value;

    if (!programId) {
      clearProgramSelection();
      return;
    }

    const selected = programs.find((program) => String(program.id) === programId);
    setSelectedProgram(programId, selected?.coursename || selected?.programName || selected?.departmentName || "");
  };
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[240px] min-h-12 bg-white border-b border-gray-200 z-20 px-4 py-2">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side - Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>{role}</span>
          <span className="text-gray-300 mx-1">›</span>
          <span className="text-gray-700 font-medium">{getPageName()}</span>
        </div>

        {/* Global selectors */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="h-8 px-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Years</option>
            {academicYearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedProgramId}
            onChange={handleProgramChange}
            className="h-8 px-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[260px]"
          >
            <option value="">All Programs</option>
            {programs.map((program) => (
              <option key={program.id} value={String(program.id)}>
                {program.coursename}
              </option>
            ))}
          </select>
        </div>

        {/* Right side - Logged in as */}
        <div className="flex items-center text-sm text-gray-600">
          <span>Logged in as: </span>
          <span className="font-medium text-gray-800 ml-1">{user?.name || "Guest"}</span>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
