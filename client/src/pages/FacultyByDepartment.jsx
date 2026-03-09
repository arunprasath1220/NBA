import React, { useState } from "react";
import axios from "axios";
import useAuthStore from "../store/authStore";
import Navbar from "../components/Navbar";
import TopBar from "../components/TopBar";
import useFilterStore from "../store/filterStore";
import { useEffect } from "react";

const FacultyByDepartment = ({ role, programId }) => {
  // Get current user / admin helper from the auth store
  const { user, isAdmin } = useAuthStore();

  const [formData, setFormData] = useState({
    program_id: programId || "",
    faculty_name: "",
    pan_no: "",
    apaar_faculty_id: "",
    highest_degree: "",
    university_name: "",
    area_of_specialization: "",
    date_of_joining: "",
    designation_at_joining: "",
    present_designation: "",
    date_designated_as_prof: "",
    date_of_receiving_highest_degree: "",
    working_presently: "",
    is_hod_principal: "No",
    experience_years: ""
  });

  const [facultyList, setFacultyList] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

  // Control showing the add form (hidden by default)
  const [showForm, setShowForm] = useState(false);

  const { selectedProgramId, programs, selectedAcademicYear } = useFilterStore();

  // Pre-fill program_id from global top-bar selection when available
  useEffect(() => {
    if (selectedProgramId) {
      setFormData((prev) => ({ ...prev, program_id: selectedProgramId }));
    }
  }, [selectedProgramId]);

  // Fetch faculty list whenever program selection changes or on mount
  useEffect(() => {
    fetchFaculty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  const fetchFaculty = async () => {
    try {
      const resp = await axios.get("http://localhost:5000/api/faculty", {
        params: selectedProgramId ? { program_id: selectedProgramId } : {},
        withCredentials: true,
      });
      if (resp.data && resp.data.success) {
        setFacultyList(resp.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching faculty:", err);
    }
  };

  // Filter programs by selectedAcademicYear (same logic used elsewhere)
  const filteredPrograms = programs && programs.length > 0
    ? (selectedAcademicYear ? programs.filter((program) => {
        const selectedStartYear = parseInt(selectedAcademicYear.split("-")[0]);
        if (!program.yearEnd) return true;
        const yearEnd = parseInt(program.yearEnd);
        const minYear = selectedStartYear - 2;
        return yearEnd >= minYear && yearEnd <= selectedStartYear;
      }) : programs)
    : [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const payload = {
        // prefer program id from the form, fall back to prop
        program_id: formData.program_id || programId,
        ...formData
      };

      if (editMode && editId) {
        await axios.put(`http://localhost:5000/api/faculty/${editId}`, payload, { withCredentials: true });
        alert("Faculty updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/faculty/add", payload, { withCredentials: true });
        alert("Faculty added successfully");
      }

      // Refresh list
      fetchFaculty();

      setFormData({
        program_id: programId || "",
        faculty_name: "",
        pan_no: "",
        apaar_faculty_id: "",
        highest_degree: "",
        university_name: "",
        area_of_specialization: "",
        date_of_joining: "",
        designation_at_joining: "",
        present_designation: "",
        date_designated_as_prof: "",
        date_of_receiving_highest_degree: "",
        working_presently: "",
        is_hod_principal: "No",
        experience_years: ""

      });

      // reset edit state
      setEditMode(false);
      setEditId(null);

    } catch (error) {
      console.error(error);
      alert("Error saving faculty: " + (error?.response?.data?.error || error.message));
    }
  };

  const handleEdit = (row) => {
    // Row contains program_id (pld.id) and program_name_id (program_name.id) from server
    setFormData({
      program_id: row.program_name_id ? String(row.program_name_id) : String(row.program_id || ""),
      faculty_name: row.faculty_name || "",
      pan_no: row.pan_no || "",
      apaar_faculty_id: row.apaar_faculty_id || "",
      highest_degree: row.highest_degree || "",
      university_name: row.university_name || "",
      area_of_specialization: row.area_of_specialization || "",
      date_of_joining: row.date_of_joining ? row.date_of_joining.split("T")[0] : "",
      designation_at_joining: row.designation_at_joining || "",
      present_designation: row.present_designation || "",
      date_designated_as_prof: row.date_designated_as_prof ? row.date_designated_as_prof.split("T")[0] : "",
      date_of_receiving_highest_degree: row.date_of_receiving_highest_degree ? row.date_of_receiving_highest_degree.split("T")[0] : "",
      working_presently: row.working_presently || "",
      nature_of_association: row.nature_of_association || "Regular",
      date_of_leaving: row.date_of_leaving ? row.date_of_leaving.split("T")[0] : "",
      experience_years: row.experience_years || "",
      is_hod_principal: row.is_hod_principal || "No",
    });
    setEditMode(true);
    setEditId(row.id);
    setShowForm(true);
  };

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="w-full">
            <div className="flex justify-end items-center mb-6">
              {isAdmin() && (
                <button
                  type="button"
                  onClick={() => setShowForm((s) => !s)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  aria-expanded={showForm}
                >
                  {showForm ? "Close" : "Add Faculty"}
                </button>
              )}
            </div>

            {/* Admin-only form */}
            {isAdmin() && showForm && (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-6 bg-white rounded-lg shadow-sm border border-gray-200">

        {/* Program (select) */}
        <div className="flex flex-col">
          <label htmlFor="program_id" className="text-sm font-medium text-gray-700">Program</label>
          <select
            id="program_id"
            name="program_id"
            value={formData.program_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Program</option>
            {filteredPrograms.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.coursename || p.programname || p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label htmlFor="faculty_name" className="text-sm font-medium text-gray-700">Faculty Name</label>
          <input
            id="faculty_name"
            type="text"
            name="faculty_name"
            placeholder="Name of the Faculty"
            value={formData.faculty_name}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* PAN */}
        <div className="flex flex-col">
          <label htmlFor="pan_no" className="text-sm font-medium text-gray-700">PAN No</label>
          <input
            id="pan_no"
            type="text"
            name="pan_no"
            placeholder="PAN No"
            value={formData.pan_no}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* APAAR */}
        <div className="flex flex-col">
          <label htmlFor="apaar_faculty_id" className="text-sm font-medium text-gray-700">APAAR Faculty ID</label>
          <input
            id="apaar_faculty_id"
            type="text"
            name="apaar_faculty_id"
            placeholder="APAAR Faculty ID"
            value={formData.apaar_faculty_id}
            onChange={handleChange}
            className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Highest Degree */}
        <div className="flex flex-col">
          <label htmlFor="highest_degree" className="text-sm font-medium text-gray-700">Highest Degree</label>
          <select
            id="highest_degree"
            name="highest_degree"
            value={formData.highest_degree}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Highest Degree</option>
            <option>M.E</option>
            <option>M.Tech</option>
            <option>Ph.D</option>
            <option>M.E and Ph.D</option>
          </select>
        </div>

        {/* University */}
        <div className="flex flex-col">
          <label htmlFor="university_name" className="text-sm font-medium text-gray-700">University</label>
          <input
            id="university_name"
            type="text"
            name="university_name"
            placeholder="University Name"
            value={formData.university_name}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Specialization */}
        <div className="flex flex-col">
          <label htmlFor="area_of_specialization" className="text-sm font-medium text-gray-700">Area of Specialization</label>
          <input
            id="area_of_specialization"
            type="text"
            name="area_of_specialization"
            placeholder="Area of Specialization"
            value={formData.area_of_specialization}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Date of Joining */}
        <div className="flex flex-col">
          <label htmlFor="date_of_joining" className="text-sm font-medium text-gray-700">Date of Joining</label>
          <input
            id="date_of_joining"
            type="date"
            name="date_of_joining"
            value={formData.date_of_joining}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Designation at Joining */}
        <div className="flex flex-col">
          <label htmlFor="designation_at_joining" className="text-sm font-medium text-gray-700">Designation at Joining</label>
          <select
            id="designation_at_joining"
            name="designation_at_joining"
            value={formData.designation_at_joining}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Designation at Joining</option>
            <option>Lecturer</option>
            <option>Assistant Professor</option>
            <option>Associate Professor</option>
            <option>Professor</option>
          </select>
        </div>

        {/* Present Designation */}
        <div className="flex flex-col">
          <label htmlFor="present_designation" className="text-sm font-medium text-gray-700">Present Designation</label>
          <select
            id="present_designation"
            name="present_designation"
            value={formData.present_designation}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Present Designation</option>
            <option>Assistant Professor</option>
            <option>Associate Professor</option>
            <option>Professor</option>
          </select>
        </div>

        {/* Date designated as Professor */}
        <div className="flex flex-col">
          <label htmlFor="date_designated_as_prof" className="text-sm font-medium text-gray-700">Date Designated as Professor</label>
          <input
            id="date_designated_as_prof"
            type="date"
            name="date_designated_as_prof"
            value={formData.date_designated_as_prof}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Date receiving degree */}
        <div className="flex flex-col">
          <label htmlFor="date_of_receiving_highest_degree" className="text-sm font-medium text-gray-700">Date of Receiving Highest Degree</label>
          <input
            id="date_of_receiving_highest_degree"
            type="date"
            name="date_of_receiving_highest_degree"
            value={formData.date_of_receiving_highest_degree}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Working currently */}
        <div className="flex flex-col">
          <label htmlFor="working_presently" className="text-sm font-medium text-gray-700">Working Currently?</label>
          <select
            id="working_presently"
            name="working_presently"
            value={formData.working_presently}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Working Currently?</option>
            <option>Yes</option>
            <option>No</option>
          </select>
        </div>

        {/* Nature of association */}
        <div className="flex flex-col">
          <label htmlFor="nature_of_association" className="text-sm font-medium text-gray-700">Nature of Association</label>
          <select
            id="nature_of_association"
            name="nature_of_association"
            value={formData.nature_of_association || 'Regular'}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="Regular">Regular</option>
            <option value="Contract">Contract</option>
            <option value="Visiting">Visiting</option>
          </select>
        </div>

        {/* Date of leaving (if applicable) */}
        <div className="flex flex-col">
          <label htmlFor="date_of_leaving" className="text-sm font-medium text-gray-700">Date of Leaving</label>
          <input
            id="date_of_leaving"
            type="date"
            name="date_of_leaving"
            value={formData.date_of_leaving || ""}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>


        {/* HoD */}
        <div className="flex flex-col">
          <label htmlFor="is_hod_principal" className="text-sm font-medium text-gray-700">Is HoD / Principal?</label>
          <select
            id="is_hod_principal"
            name="is_hod_principal"
            value={formData.is_hod_principal}
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        {/* Experience */}
        <div className="flex flex-col">
          <label htmlFor="experience_years" className="text-sm font-medium text-gray-700">Experience (Years)</label>
          <input
            id="experience_years"
            type="number"
            step="0.1"
            name="experience_years"
            placeholder="Experience (Years)"
            value={formData.experience_years}
            onChange={handleChange}
            className="border rounded-lg p-2"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="col-span-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
        >
          {editMode ? "Update Faculty" : "Add Faculty"}
        </button>

      </form>
            )}

            {/* Faculty list - visible to both admin and user */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Faculty List</h3>
              {facultyList.length === 0 ? (
                <div className="text-sm text-gray-500">No faculty records found.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                              <th className="px-3 py-3 border border-gray-300 font-semibold">S.No</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Name of the Faculty</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">PAN No.</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">APAAR / AADHAAR Linked Faculty ID</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Highest Degree</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">University Name</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Area of Specialization</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Date of Joining</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Designation at Joining</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Present Designation</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Date designated as Prof</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Date of Receiving highest degree</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Nature of Association</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Working Currently</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Date of Leaving</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Experience (in years)</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Is HoD / Principal</th>
                              <th className="px-3 py-3 border border-gray-300 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white">
                            {facultyList.map((row, index) => (
                              <tr key={row.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-3 py-2 border border-gray-300 text-center">{index + 1}</td>
                                <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{row.faculty_name || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.pan_no || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.apaar_faculty_id || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.highest_degree || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.university_name || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.area_of_specialization || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_joining ? new Date(row.date_of_joining).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.designation_at_joining || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.present_designation || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_designated_as_prof ? new Date(row.date_designated_as_prof).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_receiving_highest_degree ? new Date(row.date_of_receiving_highest_degree).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="px-3 py-2 border border-gray-300">{row.nature_of_association || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 text-center">{row.working_presently || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 whitespace-nowrap">{row.date_of_leaving ? new Date(row.date_of_leaving).toLocaleDateString('en-GB') : '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 text-center">{row.experience_years || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 text-center">{row.is_hod_principal || '-'}</td>
                                <td className="px-3 py-2 border border-gray-300 text-center whitespace-nowrap">
                                  {isAdmin() ? (
                                    <button type="button" onClick={() => handleEdit(row)} className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">Edit</button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

export default FacultyByDepartment;