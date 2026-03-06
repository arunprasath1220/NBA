import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AllPrograms = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState({
    discipline: "",
    levelOfProgram: "",
    nameOfProgram: "",
    nameOfDepartment: "",
    yearOfStart: "",
    yearOfEnd: "",
  });

  // State for dropdown options from API
  const [disciplineOptions, setDisciplineOptions] = useState([]);
  const [levelOptions, setLevelOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for courses table
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // State for academic year filter
  const [academicYear, setAcademicYear] = useState("");
  const academicYearOptions = ["2025-26", "2026-27", "2027-28", "2028-29"];

  // Filter courses based on selected academic year
  const filteredCourses = academicYear
    ? courses.filter((course) => {
        // Extract the start year from academic year (e.g., "2026-27" -> 2026)
        const selectedStartYear = parseInt(academicYear.split("-")[0]);
        
        // Show courses with no year of close
        if (!course.yearEnd) {
          return true;
        }
        
        // Show courses where year of close is within the last 3 years (including selected year)
        const yearEnd = parseInt(course.yearEnd);
        const minYear = selectedStartYear - 2; // e.g., for 2026: show 2024, 2025, 2026
        return yearEnd >= minYear && yearEnd <= selectedStartYear;
      })
    : courses;

  // Fetch disciplines from API
  const fetchDisciplines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/institute/disciplines", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setDisciplineOptions(data.data);
      }
    } catch (error) {
      console.error("Error fetching disciplines:", error);
    }
  };

  // Fetch program levels from API
  const fetchProgramLevels = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/institute/program-levels", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setLevelOptions(data.data);
      }
    } catch (error) {
      console.error("Error fetching program levels:", error);
    }
  };

  // Fetch all courses from API
  const fetchCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const response = await fetch("http://localhost:5000/api/institute/courses", {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch dropdown data and courses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDisciplines();
      fetchProgramLevels();
      fetchCourses();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCourseSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let response;
      
      if (isEditMode) {
        // Update existing course
        response = await fetch(`http://localhost:5000/api/institute/course/${editingCourseId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            disciplineId: formData.discipline,
            levelId: formData.levelOfProgram,
            programName: formData.nameOfProgram,
            departmentName: formData.nameOfDepartment,
            yearOfStart: formData.yearOfStart,
            yearOfEnd: formData.yearOfEnd || null,
          }),
        });
      } else {
        // Add new course
        response = await fetch("http://localhost:5000/api/institute/course", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            disciplineId: formData.discipline,
            levelId: formData.levelOfProgram,
            programName: formData.nameOfProgram,
            departmentName: formData.nameOfDepartment,
            yearOfStart: formData.yearOfStart,
          }),
        });
      }

      const data = await response.json();

      if (data.success) {
        alert(isEditMode ? "Course updated successfully!" : "Course added successfully!");
        resetForm();
        fetchCourses(); // Refresh the courses table
      } else {
        alert(data.error || (isEditMode ? "Failed to update course" : "Failed to add course"));
      }
    } catch (error) {
      console.error(isEditMode ? "Error updating course:" : "Error adding course:", error);
      alert(isEditMode ? "Failed to update course. Please try again." : "Failed to add course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      discipline: "",
      levelOfProgram: "",
      nameOfProgram: "",
      nameOfDepartment: "",
      yearOfStart: "",
      yearOfEnd: "",
    });
    setShowForm(false);
    setIsEditMode(false);
    setEditingCourseId(null);
  };

  const handleEditCourse = (course) => {
    setFormData({
      discipline: course.disciplineId?.toString() || "",
      levelOfProgram: course.levelId?.toString() || "",
      nameOfProgram: course.programName || "",
      nameOfDepartment: course.departmentName || "",
      yearOfStart: course.yearStart?.toString() || "",
      yearOfEnd: course.yearEnd?.toString() || "",
    });
    setEditingCourseId(course.id);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleAddNewCourse = () => {
    resetForm();
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetForm();
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = filteredCourses.map((course, index) => ({
      "Sr.No.": index + 1,
      "Discipline": course.discipline || "-",
      "Level of Program": course.level || "-",
      "Name of the Program": course.programName || "-",
      "Year of Start": course.yearStart || "-",
      "Year of Close": course.yearEnd || "-",
      "Name of The Department": course.departmentName || "-",
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Programs");
    
    worksheet["!cols"] = [
      { wch: 8 },  // Sr.No.
      { wch: 20 }, // Discipline
      { wch: 18 }, // Level of Program
      { wch: 30 }, // Name of the Program
      { wch: 15 }, // Year of Start
      { wch: 15 }, // Year of Close
      { wch: 30 }, // Name of The Department
    ];
    
    XLSX.writeFile(workbook, "All_Programs.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("landscape");
    
    doc.setFontSize(16);
    doc.text("All Programs", 14, 15);
    
    const tableHeaders = ["Sr.No.", "Discipline", "Level of Program", "Name of the Program", "Year of Start", "Year of Close", "Name of The Department"];
    
    const tableData = filteredCourses.map((course, index) => [
      String(index + 1),
      course.discipline || "-",
      course.level || "-",
      course.programName || "-",
      course.yearStart?.toString() || "-",
      course.yearEnd?.toString() || "-",
      course.departmentName || "-",
    ]);
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      theme: "grid",
    });
    
    doc.save("All_Programs.pdf");
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          {/* Academic Year Filter and Add Course Link */}
          <div className="w-full">
            <div className="flex justify-between items-center py-2 mb-2">
              {/* Academic Year Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Academic Year:
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">--Select Year--</option>
                  {academicYearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Buttons and Add Course Link */}
              <div className="flex items-center gap-4">
                {/* Export Buttons - Available to all users */}
                {filteredCourses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={exportToExcel}
                      className="px-3 py-1.5 border-2 border-green-600 text-green-600 bg-transparent rounded hover:bg-green-50 transition-colors font-medium text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Excel
                    </button>
                    <button
                      type="button"
                      onClick={exportToPDF}
                      className="px-3 py-1.5 border-2 border-red-600 text-red-600 bg-transparent rounded hover:bg-red-50 transition-colors font-medium text-sm flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </button>
                  </div>
                )}
                {/* Add Course Link - Only for admin */}
                {isAdmin() && (
                  <div>
                    {!showForm ? (
                      <button
                        type="button"
                        onClick={handleAddNewCourse}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                      >
                        Add Course
                      </button>
                      ) : (
                      <button
                        type="button"
                        onClick={handleCloseForm}
                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                      >
                        Close
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add/Edit Course Form - Only for admin */}
          {isAdmin() && showForm && (
            <form onSubmit={handleAddCourseSubmit}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {isEditMode ? "Edit Course" : "Add Course"}
                  </h3>
                  {/* Row 1: Discipline, Level of Program, Name of Program */}
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Discipline Dropdown */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discipline
                      </label>
                      <select
                        name="discipline"
                        value={formData.discipline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">--Select Discipline--</option>
                        {disciplineOptions.map((option) => (
                          <option key={option.id} value={String(option.id)}>
                            {option.discipline}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level of Program Dropdown */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Level of Program
                      </label>
                      <select
                        name="levelOfProgram"
                        value={formData.levelOfProgram}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      >
                        <option value="">--Select Level--</option>
                        {levelOptions.map((option) => (
                          <option key={option.id} value={String(option.id)}>
                            {option.level}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name of Program Input */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name of The Program
                      </label>
                      <input
                        type="text"
                        name="nameOfProgram"
                        value={formData.nameOfProgram}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter program name"
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Year of Start, Year of End (edit only), Name of Department */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Year of Start */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Year of Start (YYYY)
                      </label>
                      <input
                        type="text"
                        name="yearOfStart"
                        value={formData.yearOfStart}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="e.g., 2024"
                        pattern="\d{4}"
                        maxLength="4"
                        required
                      />
                    </div>

                    {/* Year of End - Only visible in edit mode */}
                    {isEditMode && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year of End (YYYY) <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="yearOfEnd"
                          value={formData.yearOfEnd}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="e.g., 2028"
                          pattern="\d{4}"
                          maxLength="4"
                        />
                      </div>
                    )}

                    {/* Name of Department Input */}
                    <div className={isEditMode ? "flex-1" : "flex-[2]"}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name of the Department
                      </label>
                      <input
                        type="text"
                        name="nameOfDepartment"
                        value={formData.nameOfDepartment}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter department name"
                        required
                      />
                    </div>
                  </div>

                {/* Form Button */}
                <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting 
                      ? (isEditMode ? "Updating..." : "Adding...") 
                      : (isEditMode ? "Update Course" : "Add Course")}
                  </button>
                </div>
            </form>
          )}

          {/* Courses Table */}
          <div className="mt-2">
            {isLoadingCourses ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No courses found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Sr.No.</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Discipline</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Level of Program</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Name of the Program</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Year of Start</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Year of Close</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Name of The Department</th>
                      {isAdmin() && (
                        <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Edit</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course, index) => (
                      <tr
                        key={course.id}
                        className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}
                      >
                        <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.discipline || "-"}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.level || "-"}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.programName || "-"}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.yearStart || "-"}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.yearEnd || "-"}</td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">{course.departmentName || "-"}</td>
                        {isAdmin() && (
                          <td className="border border-gray-300 px-4 py-2 text-sm">
                            <button
                              type="button"
                              onClick={() => handleEditCourse(course)}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AllPrograms;
