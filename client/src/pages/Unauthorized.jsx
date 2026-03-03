import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full fixed top-0 left-0 bg-[#f5f5f5]">
      <div className="bg-white p-12 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] text-center max-w-[400px] w-full">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-[#333] text-[1.75rem] mb-3">Access Denied</h1>
        <p className="text-gray-500 text-base mb-6">You do not have permission to access this page.</p>
        <button onClick={handleGoBack} className="bg-gradient-to-br from-[#0095ff] to-[#0066cc] text-white border-none py-3 px-8 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(0,149,255,0.4)]">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
