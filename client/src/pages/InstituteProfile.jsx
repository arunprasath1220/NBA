import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useFilterStore from "../store/filterStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "http://localhost:5000/api";
const DRAFT_STORAGE_KEY = "institute_profile_draft";

const InstituteProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const { selectedProgramId, selectedProgramLabel } = useFilterStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [formData, setFormData] = useState({
    // Program Applied For
    programAppliedFor: "",
    // A1. Name of the Institute
    instituteName: "",
    yearOfEstablishment: "",
    location: "",
    // A2. Institute Address
    address: "",
    city: "",
    state: "",
    pinCode: "",
    website: "",
    email: "",
    phoneNo: "",
    // A3. Head of the Institution
    headName: "",
    headDesignation: "",
    appointmentStatus: "",
    // A4. Contact details of Head of Institution
    headMobileNo: "",
    headTelephoneNo: "",
    headEmail: "",
    // A5. Affiliating University
    universityName: "",
    universityCity: "",
    universityState: "",
    universityPinCode: "",
    // A6 & A7
    institutionType: "",
    ownershipStatus: "",
    // Tire
    tire: "",
    // Program Details (view only)
    programName: "",
    discipline: "",
    level: "",
  });

  // Fetch institute profile data
  const fetchInstituteProfile = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch(`${API_URL}/institute/profile`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFormData({
          // Global top-bar program selection should take precedence on this page.
          programAppliedFor: selectedProgramLabel || data.data.programAppliedFor || "",
          instituteName: data.data.instituteName || "",
          yearOfEstablishment: data.data.yearOfEstablishment || "",
          location: data.data.location || "",
          address: data.data.address || "",
          city: data.data.city || "",
          state: data.data.state || "",
          pinCode: data.data.pinCode || "",
          website: data.data.website || "",
          email: data.data.email || "",
          phoneNo: data.data.phoneNo || "",
          headName: data.data.headName || "",
          headDesignation: data.data.headDesignation || "",
          appointmentStatus: data.data.appointmentStatus || "",
          headMobileNo: data.data.headMobileNo || "",
          headTelephoneNo: data.data.headTelephoneNo || "",
          headEmail: data.data.headEmail || "",
          universityName: data.data.universityName || "",
          universityCity: data.data.universityCity || "",
          universityState: data.data.universityState || "",
          universityPinCode: data.data.universityPinCode || "",
          institutionType: data.data.institutionType || "",
          ownershipStatus: data.data.ownershipStatus || "",
          tire: data.data.tire || "",
          programName: data.data.programName || "",
          discipline: data.data.discipline || "",
          level: data.data.level || "",
        });
      }
    } catch (error) {
      console.error("Error fetching institute profile:", error);
      setMessage({ type: "error", text: "Failed to load institute profile" });
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch program details (level, discipline) by program ID
  const fetchProgramDetails = async (programId) => {
    try {
      const response = await fetch(`${API_URL}/institute/programs/${programId}/details`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.data) {
        setFormData((prev) => ({
          ...prev,
          level: data.data.level || "",
          discipline: data.data.discipline || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchInstituteProfile();
    }
  }, [isAuthenticated, isLoading]);

  // Keep program info in sync with global top bar selection.
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      programAppliedFor: selectedProgramLabel || "",
    }));

    if (selectedProgramId) {
      fetchProgramDetails(selectedProgramId);
    } else {
      setFormData((prev) => ({
        ...prev,
        level: "",
        discipline: "",
      }));
    }
  }, [selectedProgramId, selectedProgramLabel]);

  // Auto-save draft to localStorage whenever formData changes
  useEffect(() => {
    // Don't save during initial loading
    if (isLoadingData) return;
    
    // Save draft to localStorage
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    
    // Show draft saved indicator
    setDraftSaved(true);
    const timer = setTimeout(() => setDraftSaved(false), 1500);
    return () => clearTimeout(timer);
  }, [formData, isLoadingData]);

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData({
          ...draftData,
          // Keep draft values, but never override global selected program label.
          programAppliedFor: selectedProgramLabel || draftData.programAppliedFor || "",
        });
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [selectedProgramLabel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin()) {
      setMessage({ type: "error", text: "Only admin can save the profile" });
      return;
    }

    try {
      setIsSaving(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${API_URL}/institute/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message || "Profile saved successfully!" });
        setSnackbarOpen(true);
        // Clear draft from localStorage after successful save
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        // Exit edit mode after successful save
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save profile" });
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error saving institute profile:", error);
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
      setSnackbarOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    // Clear draft from localStorage
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    fetchInstituteProfile();
    setMessage({ type: "", text: "" });
    setIsEditing(false);
  };

  // Export to Excel
  const exportToExcel = () => {
    const exportData = [
      { "Field": "Program Applied For", "Value": formData.programAppliedFor || "-" },
      { "Field": "A1. Name of the Institute", "Value": formData.instituteName || "-" },
      { "Field": "Year of Establishment", "Value": formData.yearOfEstablishment || "-" },
      { "Field": "Location of the Institute", "Value": formData.location || "-" },
      { "Field": "A2. Address", "Value": formData.address || "-" },
      { "Field": "City", "Value": formData.city || "-" },
      { "Field": "State", "Value": formData.state || "-" },
      { "Field": "Pin Code", "Value": formData.pinCode || "-" },
      { "Field": "Website", "Value": formData.website || "-" },
      { "Field": "Email", "Value": formData.email || "-" },
      { "Field": "Phone No", "Value": formData.phoneNo || "-" },
      { "Field": "A3. Head of Institution - Name", "Value": formData.headName || "-" },
      { "Field": "Head Designation", "Value": formData.headDesignation || "-" },
      { "Field": "Appointment Status", "Value": formData.appointmentStatus || "-" },
      { "Field": "A4. Head Mobile No", "Value": formData.headMobileNo || "-" },
      { "Field": "Head Telephone No", "Value": formData.headTelephoneNo || "-" },
      { "Field": "Head Email", "Value": formData.headEmail || "-" },
      { "Field": "A5. Affiliating University Name", "Value": formData.universityName || "-" },
      { "Field": "University City", "Value": formData.universityCity || "-" },
      { "Field": "University State", "Value": formData.universityState || "-" },
      { "Field": "University Pin Code", "Value": formData.universityPinCode || "-" },
      { "Field": "A6. Type of Institution", "Value": formData.institutionType || "-" },
      { "Field": "A7. Ownership Status", "Value": formData.ownershipStatus || "-" },
      { "Field": "Program Name", "Value": formData.programAppliedFor || "-" },
      { "Field": "Discipline", "Value": formData.discipline || "-" },
      { "Field": "Level", "Value": formData.level || "-" },
      { "Field": "Tier", "Value": formData.tire || "-" },
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Institute Profile");
    
    worksheet["!cols"] = [
      { wch: 35 }, // Field
      { wch: 50 }, // Value
    ];
    
    XLSX.writeFile(workbook, "Institute_Profile.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF("portrait");
    
    doc.setFontSize(16);
    doc.text("Institute Profile", 14, 15);
    
    const tableHeaders = ["Field", "Value"];
    
    const tableData = [
      ["Program Applied For", formData.programAppliedFor || "-"],
      ["A1. Name of the Institute", formData.instituteName || "-"],
      ["Year of Establishment", formData.yearOfEstablishment || "-"],
      ["Location of the Institute", formData.location || "-"],
      ["A2. Address", formData.address || "-"],
      ["City", formData.city || "-"],
      ["State", formData.state || "-"],
      ["Pin Code", formData.pinCode || "-"],
      ["Website", formData.website || "-"],
      ["Email", formData.email || "-"],
      ["Phone No", formData.phoneNo || "-"],
      ["A3. Head of Institution - Name", formData.headName || "-"],
      ["Head Designation", formData.headDesignation || "-"],
      ["Appointment Status", formData.appointmentStatus || "-"],
      ["A4. Head Mobile No", formData.headMobileNo || "-"],
      ["Head Telephone No", formData.headTelephoneNo || "-"],
      ["Head Email", formData.headEmail || "-"],
      ["A5. Affiliating University Name", formData.universityName || "-"],
      ["University City", formData.universityCity || "-"],
      ["University State", formData.universityState || "-"],
      ["University Pin Code", formData.universityPinCode || "-"],
      ["A6. Type of Institution", formData.institutionType || "-"],
      ["A7. Ownership Status", formData.ownershipStatus || "-"],
      ["Program Name", formData.programAppliedFor || "-"],
      ["Discipline", formData.discipline || "-"],
      ["Level", formData.level || "-"],
      ["Tier", formData.tire || "-"],
    ];
    
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: {
        0: { cellWidth: 70, fontStyle: "bold" },
        1: { cellWidth: 110 },
      },
      theme: "grid",
    });
    
    doc.save("Institute_Profile.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
      </div>
    );
  }

  const inputClass = isEditing 
    ? "bg-transparent border-none outline-none text-sm text-gray-900 flex-1"
    : "bg-transparent border-none outline-none text-sm text-gray-900 flex-1 cursor-default caret-transparent pointer-events-none";

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          {isLoadingData ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
          {/* Academic Year Display */}
          <div className="mb-3 text-sm text-gray-700">
            Program Applied For: <span className="font-semibold text-gray-800">{formData.programAppliedFor || "Not selected"}</span>
            {isEditing && <span className="ml-4 text-gray-500 italic">You are in edit mode</span>}
          </div>

          {/* Institute Profile Heading with Action Buttons */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Institute Profile</h2>
            <div className="flex items-center gap-4">
              {/* Export Buttons - Available to all users */}
              <button
                type="button"
                onClick={exportToExcel}
                className="text-green-600 hover:text-green-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Excel
              </button>
              <button
                type="button"
                onClick={exportToPDF}
                className="text-red-600 hover:text-red-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                PDF
              </button>
              {/* Edit/Back Link - Only for admin */}
              {isAdmin() && (
                <>
                  {isEditing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        fetchInstituteProfile();
                        setMessage({ type: "", text: "" });
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                    >
                      Back to page
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Draft Saved Indicator */}
          {draftSaved && isEditing && (
            <div className="fixed top-20 right-4 bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg z-50 transition-opacity">
              Draft saved
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="w-full transition-all duration-300">
            <table className="w-full border-collapse bg-white text-sm table-fixed" style={{ borderSpacing: 0 }}>
                <tbody>
                  {/* Name of the Program Applied for - Only show in view mode (not in edit page) */}
                  {!isEditing && (
                    <tr>
                      <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                        <span className="font-bold">Name of the Program Applied for</span>:
                        <select
                          name="programAppliedFor"
                          value={formData.programAppliedFor}
                          disabled
                          className="bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 ml-1 px-2 py-1 w-64 cursor-not-allowed"
                        >
                          <option value="">
                            {selectedProgramLabel ? selectedProgramLabel : "Select Program in Top Bar"}
                          </option>
                        </select>
                      </td>
                    </tr>
                  )}

                  {/* A1. Name of the Institute */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A1.Name of the Institute</span>:
                      <input
                        type="text"
                        name="instituteName"
                        value={formData.instituteName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-[70%]`}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 w-1/2">
                      <span>Year of Establishment :</span>
                      <input
                        type="text"
                        name="yearOfEstablishment"
                        value={formData.yearOfEstablishment}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-32`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5 w-1/2">
                      <span>Location of the Institute:</span>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-40`}
                        required
                      />
                    </td>
                  </tr>

                  {/* A2. Institute Address */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A2. Institute Address</span>:
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-[80%]`}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>City:</span>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-40`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>State:</span>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-40`}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Pin Code:</span>
                      <input
                        type="text"
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-28`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Website:</span>
                      <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-48`}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Email:</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-56`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Phone No(with STD Code):</span>
                      <input
                        type="text"
                        name="phoneNo"
                        value={formData.phoneNo}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                        required
                      />
                    </td>
                  </tr>

                  {/* A3. Head of the Institution */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A3. Head of the Institution</span>:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Name:</span>
                      <input
                        type="text"
                        name="headName"
                        value={formData.headName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-56`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Designation:</span>
                      <input
                        type="text"
                        name="headDesignation"
                        value={formData.headDesignation}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-40`}
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Status of Appointment :</span>
                      <input
                        type="text"
                        name="appointmentStatus"
                        value={formData.appointmentStatus}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-28`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5"></td>
                  </tr>

                  {/* A4. Contact details of Head of Institution */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A4. Contact details of Head of Institution</span>:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Mobile No.:</span>
                      <input
                        type="tel"
                        name="headMobileNo"
                        value={formData.headMobileNo}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Telephone No. (With STD Code):</span>
                      <input
                        type="text"
                        name="headTelephoneNo"
                        value={formData.headTelephoneNo}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>E-mail:</span>
                      <input
                        type="email"
                        name="headEmail"
                        value={formData.headEmail}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-56`}
                        required
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5"></td>
                  </tr>

                  {/* A5. Name and Address of the Affiliating University */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A5. Name and Address of the Affiliating University (if any)</span>:
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Name of the University :</span>
                      <input
                        type="text"
                        name="universityName"
                        value={formData.universityName}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-64`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>City:</span>
                      <input
                        type="text"
                        name="universityCity"
                        value={formData.universityCity}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>State :</span>
                      <input
                        type="text"
                        name="universityState"
                        value={formData.universityState}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-1.5">
                      <span>Pin Code:</span>
                      <input
                        type="text"
                        name="universityPinCode"
                        value={formData.universityPinCode}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-28`}
                      />
                    </td>
                  </tr>

                  {/* A6. Type of the Institution */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A6. Type of the Institution</span>:
                      <input
                        type="text"
                        name="institutionType"
                        value={formData.institutionType}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-48`}
                        required
                      />
                    </td>
                  </tr>

                  {/* A7. Ownership Status */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">A7. Ownership Status</span>:
                      <input
                        type="text"
                        name="ownershipStatus"
                        value={formData.ownershipStatus}
                        onChange={handleChange}
                        readOnly={!isEditing}
                        className={`${inputClass} ml-1 w-36`}
                        required
                      />
                    </td>
                  </tr>

                  {/* Program Details - Only show in view mode */}
                  {!isEditing && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 w-1/2">
                          <span className="font-bold">Program Name</span> : {formData.programAppliedFor}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 w-1/2">
                          <span className="font-bold">Discipline</span>: {formData.discipline}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2">
                          <span className="font-bold">Level</span> : {formData.level}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <span className="font-bold">Tier</span>: {formData.tire}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>

              {/* Snackbar Notification */}
              <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Alert
                  onClose={() => setSnackbarOpen(false)}
                  severity={message.type === "success" ? "success" : "error"}
                  variant="standard"
                  sx={{
                    minWidth: 300,
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    border: message.type === "success" 
                      ? "1px solid #d1d5db" 
                      : "1px solid #d1d5db",
                    borderLeft: message.type === "success"
                      ? "4px solid #059669"
                      : "4px solid #dc2626",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    color: "#374151",
                    fontWeight: 400,
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    "& .MuiAlert-icon": {
                      color: message.type === "success" ? "#059669" : "#dc2626",
                      opacity: 0.9,
                    },
                    "& .MuiAlert-action": {
                      padding: 0,
                      "& .MuiIconButton-root": {
                        color: "#6b7280",
                        "&:hover": {
                          backgroundColor: "#f3f4f6",
                        },
                      },
                    },
                  }}
                >
                  {message.text}
                </Alert>
              </Snackbar>

              {/* Submit Button - Only show when editing */}
              {isEditing && (
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 rounded"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstituteProfile;
