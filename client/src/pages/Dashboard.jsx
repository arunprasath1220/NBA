import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout, fetchUser } =
    useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen w-full p-8">
        <div className="flex justify-center items-center min-h-screen text-2xl text-[#333]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-8">
      <div className="bg-white p-12 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] text-center max-w-[500px] w-full">
        <h1 className="text-[#333] mb-8 text-[2rem]">Dashboard</h1>
        <div className="text-left bg-[#f8f9fa] p-6 rounded-xl mb-8">
          <h2 className="text-[#333] mb-4 text-[1.3rem]">Welcome, {user.name}!</h2>
          <p className="text-[#555] mb-2 text-[0.95rem]">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-[#555] mb-2 text-[0.95rem]">
            <strong>User ID:</strong> {user.id}
          </p>
          {user.roles && user.roles.length > 0 && (
            <p className="text-[#555] mb-2 text-[0.95rem]">
              <strong>Roles:</strong> {user.roles.join(", ")}
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none py-3 px-8 text-base rounded-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(102,126,234,0.4)] active:translate-y-0">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
