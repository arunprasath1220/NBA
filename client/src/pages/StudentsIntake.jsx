import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const intakeFields = [
  { label: "Name of Program", name: "programName", placeholder: "Enter program name" },
  { label: "Program Applied Level", name: "programAppliedLevel", placeholder: "UG / PG / Diploma" },
  { label: "Start of Year", name: "startYear", placeholder: "e.g. 2022" },
  { label: "Year of AICTE Approval", name: "aicteApprovalYear", placeholder: "e.g. 2024" },
  { label: "Initial Intake", name: "initialIntake", placeholder: "Enter initial intake" },
  { label: "Intake Increase", name: "intakeIncrease", placeholder: "Enter increase" },
  { label: "Current Intake", name: "currentIntake", placeholder: "Enter current intake" },
  { label: "Accreditation Status*", name: "accreditationStatus", placeholder: "NBA / NAAC / N/A" },
  { label: "From", name: "accreditationFrom", placeholder: "YYYY" },
  { label: "To", name: "accreditationTo", placeholder: "YYYY" },
  { label: "Program for Consideration", name: "programForConsideration", placeholder: "Yes / No" },
  { label: "Program Duration", name: "programDuration", placeholder: "e.g. 4" },
];

const StudentsIntake = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const { selectedAcademicYear } = useFilterStore();
  const [savedIntakeData, setSavedIntakeData] = useState(null);
  const [formData, setFormData] = useState({
    programName: "",
    programAppliedLevel: "",
    startYear: "",
    aicteApprovalYear: "",
    initialIntake: "",
    intakeIncrease: "",
    currentIntake: "",
    accreditationStatus: "",
    accreditationFrom: "",
    accreditationTo: "",
    programForConsideration: "",
    programDuration: "",
  });

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setSavedIntakeData(formData);
  };

  const handleReset = () => {
    setFormData({
      programName: "",
      programAppliedLevel: "",
      startYear: "",
      aicteApprovalYear: "",
      initialIntake: "",
      intakeIncrease: "",
      currentIntake: "",
      accreditationStatus: "",
      accreditationFrom: "",
      accreditationTo: "",
      programForConsideration: "",
      programDuration: "",
    });
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
      <Navbar />
      <TopBar />
      <main className="flex-1 min-w-0 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14 max-w-full">
          <div className="w-full max-w-full">
            {/* Academic Year Display */}
            <div className="mb-4 text-sm text-gray-600">
              Academic Year: <span className="font-semibold text-gray-800">{selectedAcademicYear || "Not selected"}</span>
            </div>

            {/* Page Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Students Intake</h1>

            {/* Admin-only form */}
            {isAdmin() && (
              <form onSubmit={handleFormSubmit} className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Intake Form</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter the intake details in the format below.</p>
                </div>

                {/* Form Grid */}
                <div className="overflow-x-auto rounded-lg border border-gray-300 mb-6">
                  <div className="inline-block min-w-full">
                    {/* Header Row */}
                    <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${intakeFields.length}, minmax(120px, 1fr))` }}>
                      {intakeFields.map((field) => (
                        <div
                          key={field.name}
                          className="bg-gray-100 border border-gray-300 px-3 py-4 text-center font-semibold text-sm text-gray-800"
                        >
                          {field.label}
                        </div>
                      ))}
                    </div>

                    {/* Input Row */}
                    <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${intakeFields.length}, minmax(120px, 1fr))` }}>
                      {intakeFields.map((field) => (
                        <div key={field.name} className="border border-gray-300 p-3">
                          <input
                            type="text"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            placeholder={field.placeholder}
                            className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Save Intake
                  </button>
                </div>
              </form>
            )}

            {/* Saved Data Display */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {savedIntakeData ? (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Saved Intake Details</h2>
                    <p className="text-sm text-gray-500 mt-1">This preview shows the intake form data.</p>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden space-y-3">
                    {intakeFields.map((field) => (
                      <div key={field.name} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-600">{field.label}</p>
                        <p className="text-sm text-gray-900 mt-1">{savedIntakeData[field.name] || "-"}</p>
                      </div>
                    ))}
                  </div>

                  {/* Desktop View */}
                  <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-300">
                    <div className="inline-block min-w-full">
                      {/* Header Row */}
                      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${intakeFields.length}, minmax(120px, 1fr))` }}>
                        {intakeFields.map((field) => (
                          <div
                            key={field.name}
                            className="bg-gray-100 border border-gray-300 px-3 py-4 text-center font-semibold text-sm text-gray-800"
                          >
                            {field.label}
                          </div>
                        ))}
                      </div>

                      {/* Data Row */}
                      <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${intakeFields.length}, minmax(120px, 1fr))` }}>
                        {intakeFields.map((field) => (
                          <div key={field.name} className="border border-gray-300 px-3 py-4 text-center text-sm text-gray-700 bg-gray-50">
                            {savedIntakeData[field.name] || "-"}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[240px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <div className="text-center">
                    <p className="text-base font-medium text-gray-700">No intake form submitted yet.</p>
                    {isAdmin() && (
                      <p className="mt-2 text-sm text-gray-500">Fill the form above and submitting the save button to display the data here.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentsIntake;
