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

  // Sample dropdown options - you can replace these with actual data from API
  const disciplineOptions = [
    "Engineering",
    "Science",
    "Arts",
    "Commerce",
    "Management",
    "Medical",
    "Law",
  ];

  const levelOptions = [
    "Undergraduate",
    "Postgraduate",
    "Diploma",
    "Certificate",
    "Doctoral",
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  const handleAddCourseSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Add your API call here to save the course
    alert("Course added successfully!");
    setFormData({
      discipline: "",
      levelOfProgram: "",
      nameOfProgram: "",
      nameOfDepartment: "",
      yearOfStart: "",
      yearOfEnd: "",
    });
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discipline Dropdown */}
                    <div className="md:col-span-2">
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
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level of Program Dropdown */}
                  <div>
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
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Name of Program Input */}
                  <div>
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

                  {/* Year of Start */}
                  <div>
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

                  {/* Year of End (Optional) */}
                  {/* <div>
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
                  </div> */}

                  {/* Name of Department Input */}
                  <div className="md:col-span-2">
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
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Add Course
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
