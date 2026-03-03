import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const API_URL = "http://localhost:5000/api";
const DRAFT_STORAGE_KEY = "institute_profile_draft";

const InstituteProfile = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [draftSaved, setDraftSaved] = useState(false);

  const [formData, setFormData] = useState({
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
        });
      }
    } catch (error) {
      console.error("Error fetching institute profile:", error);
      setMessage({ type: "error", text: "Failed to load institute profile" });
    } finally {
      setIsLoadingData(false);
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
        setFormData(draftData);
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, []);

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
        // Clear draft from localStorage after successful save
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        // Exit edit mode after successful save
        setIsEditing(false);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save profile" });
      }
    } catch (error) {
      console.error("Error saving institute profile:", error);
      setMessage({ type: "error", text: "Failed to save profile. Please try again." });
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

  if (isLoading || isLoadingData) {
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
        <div className="pt-16 lg:pt-14">
          {/* Edit Button - Only for admin */}
          {isAdmin() && !isEditing && (
            <div className="flex justify-end px-4 py-2">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm rounded shadow"
              >
                Edit
              </button>
            </div>
          )}
          
          {/* Draft Saved Indicator */}
          {draftSaved && isEditing && (
            <div className="fixed top-20 right-4 bg-gray-700 text-white text-xs px-3 py-1.5 rounded shadow-lg z-50 transition-opacity">
              Draft saved
            </div>
          )}
          
          <form onSubmit={handleSubmit} className={`w-full transition-all duration-300 ${isEditing ? 'p-4 bg-gray-50 shadow-lg rounded-lg mx-2' : ''}`}>
            <table className="w-full border-collapse bg-white text-sm" style={{ borderSpacing: 0 }}>
                <tbody>
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

                  {/* Tire */}
                  <tr>
                    <td colSpan={2} className="border border-gray-300 px-2 py-1.5">
                      <span className="font-bold">Tire</span>:
                      <input
                        type="text"
                        name="tire"
                        value={formData.tire}
                        onChange={handleChange}
                        className={`${inputClass} ml-1 w-48`}
                        readOnly={!isEditing}
                        required
                      />
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Message Display */}
              {message.text && (
                <div className={`mt-4 p-3 rounded ${
                  message.type === "success" 
                    ? "bg-green-100 text-green-700 border border-green-300" 
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}>
                  {message.text}
                </div>
              )}

              {/* Submit Button - Only show when editing */}
              {isEditing && (
                <div className="flex justify-end gap-4 mt-4 pr-4 pb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchInstituteProfile();
                      setMessage({ type: "", text: "" });
                    }}
                    className="px-6 py-2 border border-gray-400 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium text-sm rounded"
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
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
        </div>
      </main>
    </div>
  );
};

export default InstituteProfile;
