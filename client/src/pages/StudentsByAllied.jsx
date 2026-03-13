import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const StudentsByAllied = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();

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

  const handleEdit = () => {
    alert("Edit functionality will be implemented here");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Student Details by Allied Dept.</h1>
              {isAdmin() && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-gray-600">Student details by allied department will be displayed here.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentsByAllied;
