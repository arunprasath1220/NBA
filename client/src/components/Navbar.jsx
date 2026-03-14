import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import nbaLogo from "../assets/National_Board_of_Accreditation.svg.png";

// SVG Icons as components
const Icons = {
  building: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  academic: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  chart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  ratio: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  clipboardList: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [preQualifierOpen, setPreQualifierOpen] = useState(true);
  const [sarOpen, setSarOpen] = useState(false);
  const [partBOpen, setPartBOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const preQualifierSections = [
    {
      section: "INSTITUTE",
      items: [
        { name: "Institute Profile", path: "/institute-profile", icon: Icons.building },
        { name: "All Programs", path: "/all-programs", icon: Icons.book },
        { name: "Allied Course Mapping", path: "/allied-mapping", icon: Icons.academic },
        { name: "Students Intake", path: "/students-intake", icon: Icons.link },
      ],
    },
    {
      section: "FACULTY",
      items: [
        { name: "Faculty by Department", path: "/faculty-department", icon: Icons.users },
        { name: "Faculty by Allied Dept.", path: "/faculty-allied", icon: Icons.user },
      ],
    },
    {
      section: "ANALYTICS",
      items: [
        { name: "Student Details by Dept.", path: "/students-department", icon: Icons.users },
        { name: "Student Details by Allied Dept.", path: "/students-allied", icon: Icons.user },
        { name: "Faculty Student Ratio by Dept.", path: "/ratio-department", icon: Icons.chart },
      ],
    },
  ];

  const sarCriteria = Array.from({ length: 9 }, (_, i) => ({
    name: `Criteria ${i + 1}`,
    path: `/sar/part-b/criteria-${i + 1}`,
  }));

  const isActive = (path) => location.pathname === path;
  const isPreQualifierRoute = preQualifierSections.some((section) =>
    section.items.some((item) => item.path === location.pathname)
  );
  const isSarRoute = location.pathname.startsWith("/sar");

  useEffect(() => {
    if (isSarRoute) {
      setSarOpen(true);
      setPreQualifierOpen(false);
      if (location.pathname.startsWith("/sar/part-b")) {
        setPartBOpen(true);
      }
    } else {
      setPreQualifierOpen(true);
      setSarOpen(false);
    }
  }, [isSarRoute, location.pathname]);

  const togglePreQualifier = () => {
    setPreQualifierOpen((prev) => {
      const next = !prev;
      if (next) {
        setSarOpen(false);
      }
      return next;
    });
  };

  const toggleSar = () => {
    setSarOpen((prev) => {
      const next = !prev;
      if (next) {
        setPreQualifierOpen(false);
      }
      return next;
    });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 
          flex flex-col transition-transform duration-300 ease-in-out z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-[240px]
        `}
      >
        {/* Logo Section */}
        <div className="px-4 h-12 border-b border-gray-100 flex items-center">
          <div className="flex items-center gap-2">
            <img src={nbaLogo} alt="NBA Logo" className="w-8 h-8" />
            <h1 className="text-base font-bold text-gray-900">BIT NBA</h1>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar pt-4">
          <div className="space-y-1">
            <div>
              <button
                onClick={togglePreQualifier}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium
                  transition-all duration-200 border-r-[3px]
                  ${
                    isPreQualifierRoute
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={isPreQualifierRoute ? "text-blue-600" : "text-gray-500"}>{Icons.book}</span>
                <span className="flex-1 text-left">Pre-Qualifier</span>
                <span className={isPreQualifierRoute ? "text-blue-600" : "text-gray-400"}>
                  {preQualifierOpen ? Icons.chevronDown : Icons.chevronRight}
                </span>
              </button>

              {preQualifierOpen && (
                <div className="mt-0.5 space-y-3">
                  {preQualifierSections.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="pl-12 pr-5 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                        {section.section}
                      </h3>
                      <ul className="space-y-0.5">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx}>
                            <Link
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`
                                flex items-center gap-3 pl-12 pr-5 py-2 text-[13px] font-medium
                                transition-all duration-200 border-r-[3px]
                                ${
                                  isActive(item.path)
                                    ? "bg-blue-50 text-blue-600 border-blue-600"
                                    : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"
                                }
                              `}
                            >
                              <span className={isActive(item.path) ? "text-blue-600" : "text-gray-500"}>{item.icon}</span>
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={toggleSar}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-[14px] font-medium
                  transition-all duration-200 border-r-[3px]
                  ${
                    isSarRoute
                      ? "bg-blue-50 text-blue-600 border-blue-600"
                      : "text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <span className={isSarRoute ? "text-blue-600" : "text-gray-500"}>{Icons.document}</span>
                <span className="flex-1 text-left">SAR</span>
                <span className={isSarRoute ? "text-blue-600" : "text-gray-400"}>
                  {sarOpen ? Icons.chevronDown : Icons.chevronRight}
                </span>
              </button>

              {sarOpen && (
                <div className="mt-0.5 space-y-0.5">
                  <Link
                    to="/sar/part-a"
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 pl-12 pr-5 py-2 text-[13px] font-medium
                      transition-all duration-200 border-r-[3px]
                      ${
                        isActive("/sar/part-a")
                          ? "bg-blue-50 text-blue-600 border-blue-600"
                          : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"
                      }
                    `}
                  >
                    <span className={isActive("/sar/part-a") ? "text-blue-600" : "text-gray-500"}>{Icons.document}</span>
                    <span>Part-A</span>
                  </Link>

                  <div>
                    <button
                      onClick={() => setPartBOpen(!partBOpen)}
                      className={`w-full flex items-center gap-3 pl-12 pr-5 py-2 text-[13px] font-medium
                        transition-all duration-200 border-r-[3px]
                        ${
                          location.pathname.startsWith("/sar/part-b")
                            ? "bg-blue-50 text-blue-600 border-blue-600"
                            : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"
                        }
                      `}
                    >
                      <span className={location.pathname.startsWith("/sar/part-b") ? "text-blue-600" : "text-gray-500"}>
                        {Icons.clipboardList}
                      </span>
                      <span className="flex-1 text-left">Part-B</span>
                      <span className={location.pathname.startsWith("/sar/part-b") ? "text-blue-600" : "text-gray-400"}>
                        {partBOpen ? Icons.chevronDown : Icons.chevronRight}
                      </span>
                    </button>

                    {partBOpen && (
                      <ul className="mt-0.5 space-y-0.5">
                        {sarCriteria.map((item, idx) => (
                          <li key={idx}>
                            <Link
                              to={item.path}
                              onClick={() => setIsOpen(false)}
                              className={`
                                flex items-center gap-3 pl-16 pr-5 py-2 text-[13px] font-medium
                                transition-all duration-200 border-r-[3px]
                                ${
                                  isActive(item.path)
                                    ? "bg-blue-50 text-blue-600 border-blue-600"
                                    : "text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-800"
                                }
                              `}
                            >
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Logout Button */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-[14px] font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            {Icons.logout}
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
