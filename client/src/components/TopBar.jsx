import { useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";

const TopBar = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuthStore();

  // Get page name from path
  const getPageName = () => {
    const pathMap = {
      "/institute-profile": "Institute Profile",
      "/all-programs": "All Programs",
      "/allied-mapping": "Allied Course Mapping",
      "/allied-department": "Allied Department",
      "/faculty-department": "Faculty by Department",
      "/faculty-allied": "Faculty by Allied Dept.",
      "/ratio-department": "Faculty Student Ratio by Dept.",
      "/ratio-allied": "Faculty Student Ratio by Allied",
    };
    return pathMap[location.pathname] || "Dashboard";
  };

  const role = isAdmin() ? "Admin" : "User";

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[240px] h-12 bg-white border-b border-gray-200 z-20 flex items-center justify-between px-4">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500">
        <span>{role}</span>
        <span className="text-gray-300 mx-1">›</span>
        <span className="text-gray-700 font-medium">{getPageName()}</span>
      </div>

      {/* Right side - Logged in as */}
      <div className="flex items-center text-sm text-gray-600">
        <span>Logged in as: </span>
        <span className="font-medium text-gray-800 ml-1">{user?.name || "Guest"}</span>
      </div>
    </header>
  );
};

export default TopBar;
