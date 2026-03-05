import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const AllPrograms = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch dropdown data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDisciplines();
      fetchProgramLevels();
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
      // Post the course to the API
      const response = await fetch("http://localhost:5000/api/institute/course", {
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

      const data = await response.json();

      if (data.success) {
        alert("Course added successfully!");
        setFormData({
          discipline: "",
          levelOfProgram: "",
          nameOfProgram: "",
          nameOfDepartment: "",
          yearOfStart: "",
          yearOfEnd: "",
        });
      } else {
        alert(data.error || "Failed to add course");
      }
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          {/* Add Course Link/Close - Only for admin */}
          {isAdmin() && (
            <div className="w-full">
              <div className="flex justify-end py-2 mb-4">
                {!showForm ? (
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                  >
                    Add Course
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Add Course Form */}
              {showForm && (
                <form onSubmit={handleAddCourseSubmit}>
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
                          <option key={option.id} value={option.id}>
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
                          <option key={option.id} value={option.id}>
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

                  {/* Row 2: Year of Start, Name of Department */}
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

                    {/* Name of Department Input */}
                    <div className="flex-[2]">
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
                    {isSubmitting ? "Adding..." : "Add Course"}
                  </button>
                </div>
              </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllPrograms;
