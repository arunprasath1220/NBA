import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";

const API_URL = "http://localhost:5000/api/allied-course";
const DRAFT_STORAGE_KEY = "alliedCourseMappingDraft";

const AlliedCourseMapping = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, isAdmin } = useAuthStore();
  
  // Load draft from localStorage on initial render
  const loadDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        return JSON.parse(savedDraft);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
    return null;
  };

  const initialDraft = loadDraft();
  const isRestoringDraft = useRef(!!initialDraft);
  
  const [showForm, setShowForm] = useState(initialDraft?.showForm || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingMappings, setIsLoadingMappings] = useState(false);
  const [isEditMode, setIsEditMode] = useState(initialDraft?.isEditMode || false);
  const [editingId, setEditingId] = useState(initialDraft?.editingId || null);

  // Form state for allied course mapping
  const [formData, setFormData] = useState(initialDraft?.formData || {
    programLevel: "",
    programName: "",
    hasAlliedDepartment: "",
    departmentName: "",
  });

  // Multiple allied departments support
  const [alliedDepartments, setAlliedDepartments] = useState(initialDraft?.alliedDepartments || []);
  // Each entry: { id: uniqueId, programLevel: '', programName: '', departmentName: '', programsOptions: [] }

  // Dropdown options from API
  const [programLevels, setProgramLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  const alliedOptions = ["Yes", "No"];

  // Allied mappings data from API
  const [alliedMappings, setAlliedMappings] = useState([]);

  // Save draft to localStorage whenever form state changes
  const saveDraft = () => {
    try {
      const draft = {
        formData,
        alliedDepartments,
        showForm,
        isEditMode,
        editingId,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing draft:", error);
    }
  };

  // Save draft whenever form data or form state changes
  useEffect(() => {
    saveDraft();
  }, [formData, alliedDepartments, showForm, isEditMode, editingId]);

  // Restore dropdown data if draft has selections
  useEffect(() => {
    const restoreDropdownData = async () => {
      if (initialDraft?.formData?.programLevel) {
        await fetchProgramsByLevel(initialDraft.formData.programLevel);
      }
      // Restore allied departments dropdown data
      if (initialDraft?.alliedDepartments?.length > 0) {
        for (const allied of initialDraft.alliedDepartments) {
          if (allied.programLevel) {
            const progs = await fetchProgramsForAllied(allied.programLevel);
            setAlliedDepartments(prev => prev.map(a => 
              a.id === allied.id ? { ...a, programsOptions: progs } : a
            ));
          }
        }
      }
      // Mark restoration as complete after dropdowns are loaded
      setTimeout(() => {
        isRestoringDraft.current = false;
      }, 100);
    };
    if (isAuthenticated && initialDraft) {
      restoreDropdownData();
    } else {
      isRestoringDraft.current = false;
    }
  }, [isAuthenticated]);

  // Fetch program levels from API
  const fetchProgramLevels = async () => {
    try {
      const response = await fetch(`${API_URL}/program-levels`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setProgramLevels(data.data);
      }
    } catch (error) {
      console.error("Error fetching program levels:", error);
    }
  };

  // Fetch programs by level from API
  const fetchProgramsByLevel = async (levelId) => {
    try {
      const response = await fetch(`${API_URL}/programs/${levelId}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setPrograms(data.data);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  // Fetch department for a program
  const fetchProgramDepartment = async (programId) => {
    try {
      const response = await fetch(`${API_URL}/program/${programId}/department`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          departmentName: data.data.departmentName || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching program department:", error);
    }
  };

  // Fetch programs for allied section (returns data instead of setting state)
  const fetchProgramsForAllied = async (levelId) => {
    try {
      const response = await fetch(`${API_URL}/programs/${levelId}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching allied programs:", error);
      return [];
    }
  };

  // Fetch department for allied program (returns department name)
  const fetchDepartmentForAllied = async (programId) => {
    try {
      const response = await fetch(`${API_URL}/program/${programId}/department`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        return data.data.departmentName || "";
      }
      return "";
    } catch (error) {
      console.error("Error fetching allied program department:", error);
      return "";
    }
  };

  // Add a new allied department entry
  const addAlliedDepartment = () => {
    const newId = Date.now();
    const newAllied = {
      id: newId,
      programLevel: formData.programLevel, // Auto-fill with main program level
      programName: "",
      departmentName: "",
      programsOptions: [],
    };
    setAlliedDepartments((prev) => [...prev, newAllied]);
    
    // Fetch programs for the new allied department if level is set
    if (formData.programLevel) {
      fetchProgramsForAllied(formData.programLevel).then((progs) => {
        setAlliedDepartments((prev) =>
          prev.map((a) => (a.id === newId ? { ...a, programsOptions: progs } : a))
        );
      });
    }
  };

  // Remove an allied department entry
  const removeAlliedDepartment = (id) => {
    setAlliedDepartments((prev) => prev.filter((a) => a.id !== id));
  };

  // Handle allied department field change
  const handleAlliedChange = async (id, field, value) => {
    setAlliedDepartments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );

    // If level changes, fetch new programs
    if (field === "programLevel" && value) {
      const progs = await fetchProgramsForAllied(value);
      setAlliedDepartments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, programsOptions: progs, programName: "", departmentName: "" }
            : a
        )
      );
    }

    // If program changes, fetch department
    if (field === "programName" && value) {
      const deptName = await fetchDepartmentForAllied(value);
      setAlliedDepartments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, departmentName: deptName } : a))
      );
    }
  };

  // Fetch all allied mappings
  const fetchAlliedMappings = async () => {
    setIsLoadingMappings(true);
    try {
      const response = await fetch(`${API_URL}/mappings`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setAlliedMappings(data.data);
      }
    } catch (error) {
      console.error("Error fetching allied mappings:", error);
    } finally {
      setIsLoadingMappings(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProgramLevels();
      fetchAlliedMappings();
    }
  }, [isAuthenticated]);

  // Fetch programs when level changes
  useEffect(() => {
    if (formData.programLevel) {
      fetchProgramsByLevel(formData.programLevel);
      // Reset program name and department when level changes (skip during draft restoration)
      if (!isRestoringDraft.current) {
        setFormData((prev) => ({
          ...prev,
          programName: "",
          departmentName: "",
        }));
      }
    } else {
      setPrograms([]);
    }
  }, [formData.programLevel]);

  // Fetch department when program changes
  useEffect(() => {
    if (formData.programName) {
      fetchProgramDepartment(formData.programName);
    } else if (!isRestoringDraft.current) {
      setFormData((prev) => ({
        ...prev,
        departmentName: "",
      }));
    }
  }, [formData.programName]);

  // Handle hasAlliedDepartment changes
  useEffect(() => {
    if (isRestoringDraft.current) return;
    
    if (formData.hasAlliedDepartment === "Yes" && alliedDepartments.length === 0) {
      // Auto-add one allied department with main program level
      addAlliedDepartment();
    } else if (formData.hasAlliedDepartment === "No") {
      // Clear allied departments when "No" is selected
      setAlliedDepartments([]);
    }
  }, [formData.hasAlliedDepartment]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = isEditMode 
        ? `${API_URL}/mapping/${editingId}`
        : `${API_URL}/mapping`;
      
      // Collect all allied program IDs
      const alliedProgramIds = alliedDepartments
        .filter((a) => a.programName)
        .map((a) => parseInt(a.programName));
      
      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          programId: formData.programName,
          hasAlliedDepartment: formData.hasAlliedDepartment,
          alliedProgramIds: alliedProgramIds.length > 0 ? alliedProgramIds : [],
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(isEditMode ? "Allied mapping updated successfully!" : "Allied mapping added successfully!");
        clearDraft();
        resetForm();
        fetchAlliedMappings();
      } else {
        alert(data.error || "Failed to save allied mapping");
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
      alert("Failed to save mapping. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = (clearStorage = false) => {
    setFormData({
      programLevel: "",
      programName: "",
      hasAlliedDepartment: "",
      departmentName: "",
    });
    setPrograms([]);
    setAlliedDepartments([]);
    setShowForm(false);
    setIsEditMode(false);
    setEditingId(null);
    if (clearStorage) {
      clearDraft();
    }
  };

  const handleCloseForm = () => {
    resetForm(true); // Clear draft when user explicitly closes the form
  };

  const handleAddNewMapping = () => {
    resetForm(true); // Clear any existing draft when starting new mapping
    setShowForm(true);
  };

  const handleEditMapping = async (group) => {
    const mainProgram = group.mainProgram;
    const alliedProgramsList = group.alliedPrograms || [];
    
    // Populate form with main program data
    setFormData({
      programLevel: mainProgram?.levelId?.toString() || "",
      programName: "",
      hasAlliedDepartment: alliedProgramsList.length > 0 ? "Yes" : "No",
      departmentName: mainProgram?.departmentName || "",
    });
    
    // Fetch programs for the main program level
    if (mainProgram?.levelId) {
      await fetchProgramsByLevel(mainProgram.levelId);
    }
    
    // Build allied departments array from existing allied programs
    const alliedDepts = [];
    for (const allied of alliedProgramsList) {
      const progs = allied.levelId ? await fetchProgramsForAllied(allied.levelId) : [];
      alliedDepts.push({
        id: Date.now() + Math.random(),
        programLevel: allied.levelId?.toString() || "",
        programName: allied.programId?.toString() || "",
        departmentName: allied.departmentName || "",
        programsOptions: progs,
      });
    }
    setAlliedDepartments(alliedDepts);
    
    // Set main program name after programs are loaded
    setFormData((prev) => ({
      ...prev,
      programName: mainProgram?.programId?.toString() || "",
    }));
    
    setEditingId(group.groupId);
    setIsEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="pt-16 lg:pt-14 p-4">
          {/* Header with Add Mapping Link */}
          <div className="w-full">
            <div className="flex justify-end items-center py-2 mb-4">
              {/* Add Mapping Link - Only for admin */}
              {isAdmin() && (
                <div>
                  {!showForm ? (
                    <button
                      type="button"
                      onClick={handleAddNewMapping}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                    >
                      Map Allied Course
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm bg-transparent border-none cursor-pointer"
                    >
                      Close
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Only: Allied Course Mapping Form */}
          {isAdmin() && showForm && (
            <form onSubmit={handleSubmit}>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isEditMode ? "Edit Allied Course Mapping" : "Map Course as Allied"}
              </h3>
              {/* Row 1: Program Level, Program Name, Department Name */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Program Level */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Level
                  </label>
                  <select
                    name="programLevel"
                    value={formData.programLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">--Select Level--</option>
                    {programLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Program Name */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name
                  </label>
                  <select
                    name="programName"
                    value={formData.programName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                    disabled={!formData.programLevel}
                  >
                    <option value="">--Select Program--</option>
                    {programs.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.programName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department Name (Auto-filled) */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name
                  </label>
                  <input
                    type="text"
                    name="departmentName"
                    value={formData.departmentName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 outline-none cursor-not-allowed"
                    placeholder="Auto-filled based on program"
                    readOnly
                  />
                </div>
              </div>

              {/* Row 2: Having Allied Department/Cluster */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                {/* Having Allied Department/Cluster */}
                <div className="flex-1 md:max-w-[33%]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Having Allied Department/Cluster ?
                  </label>
                  <select
                    name="hasAlliedDepartment"
                    value={formData.hasAlliedDepartment}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">--Select--</option>
                    {alliedOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allied Department Section - Shows when "Yes" is selected */}
              {formData.hasAlliedDepartment === "Yes" && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold text-gray-700">
                      Allied Department Details
                    </h4>
                    <button
                      type="button"
                      onClick={addAlliedDepartment}
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                    >
                      + Add Allied Department
                    </button>
                  </div>
                  
                  {alliedDepartments.map((allied, index) => (
                    <div key={allied.id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-600">
                          Allied Department {index + 1}
                        </span>
                        {alliedDepartments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeAlliedDepartment(allied.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Allied Program Level */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program Level
                          </label>
                          <select
                            value={allied.programLevel}
                            onChange={(e) => handleAlliedChange(allied.id, "programLevel", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                          >
                            <option value="">--Select Level--</option>
                            {programLevels.map((level) => (
                              <option key={level.id} value={level.id}>
                                {level.level}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Allied Program Name */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program Name
                          </label>
                          <select
                            value={allied.programName}
                            onChange={(e) => handleAlliedChange(allied.id, "programName", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                            disabled={!allied.programLevel}
                          >
                            <option value="">--Select Program--</option>
                            {(allied.programsOptions || [])
                              .filter((program) => {
                                // Exclude main program and programs already selected in other allied departments
                                const selectedIds = [
                                  formData.programName,
                                  ...alliedDepartments
                                    .filter((a) => a.id !== allied.id)
                                    .map((a) => a.programName)
                                ];
                                return !selectedIds.includes(program.id.toString());
                              })
                              .map((program) => (
                                <option key={program.id} value={program.id}>
                                  {program.programName}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Allied Department/Cluster Name (Auto-filled) */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allied Department/Cluster Name
                          </label>
                          <input
                            type="text"
                            value={allied.departmentName}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 outline-none cursor-not-allowed"
                            placeholder="Auto-filled based on program"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}


              {/* Form Button */}
              <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? (isEditMode ? "Updating..." : "Saving...") 
                    : (isEditMode ? "Update Mapping" : "Save Mapping")}
                </button>
              </div>
            </form>
          )}

          {/* Allied Mappings Table */}
          <div className="mt-6">
            {isLoadingMappings ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
              </div>
            ) : alliedMappings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No allied mappings found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Sr.No.</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Program Level</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Program Name</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Department Name</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Allied Program Level</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Allied Program Name</th>
                      <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Allied Department</th>
                      {isAdmin() && (
                        <th className="border border-blue-700 px-4 py-3 text-left text-sm font-semibold">Edit</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {alliedMappings.map((group, index) => {
                      const alliedCount = group.alliedPrograms?.length || 1;
                      return group.alliedPrograms?.map((allied, alliedIndex) => (
                        <tr
                          key={`${group.groupId}-${allied.programId}`}
                          className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}
                        >
                          {alliedIndex === 0 && (
                            <>
                              <td className="border border-gray-300 px-4 py-2 text-sm" rowSpan={alliedCount}>{index + 1}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm" rowSpan={alliedCount}>{group.mainProgram?.programLevel || "-"}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm" rowSpan={alliedCount}>{group.mainProgram?.programName || "-"}</td>
                              <td className="border border-gray-300 px-4 py-2 text-sm" rowSpan={alliedCount}>{group.mainProgram?.departmentName || "-"}</td>
                            </>
                          )}
                          <td className="border border-gray-300 px-4 py-2 text-sm">{allied.programLevel || "-"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{allied.programName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{allied.departmentName || "-"}</td>
                          {isAdmin() && alliedIndex === 0 && (
                            <td className="border border-gray-300 px-4 py-2 text-sm" rowSpan={alliedCount}>
                              <button
                                type="button"
                                onClick={() => handleEditMapping(group)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      )) || (
                        <tr key={group.groupId} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{group.mainProgram?.programLevel || "-"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{group.mainProgram?.programName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">{group.mainProgram?.departmentName || "-"}</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-sm">-</td>
                          {isAdmin() && (
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              <button
                                type="button"
                                onClick={() => handleEditMapping(group)}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AlliedCourseMapping;
