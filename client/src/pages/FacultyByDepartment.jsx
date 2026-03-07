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

  // Control showing the add form (hidden by default)
  const [showForm, setShowForm] = useState(false);

  const { selectedProgramId, programs, selectedAcademicYear } = useFilterStore();

  // Pre-fill program_id from global top-bar selection when available
  useEffect(() => {
    if (selectedProgramId) {
      setFormData((prev) => ({ ...prev, program_id: selectedProgramId }));
    }
  }, [selectedProgramId]);

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

      await axios.post("http://localhost:5000/api/faculty/add", payload);

      alert("Faculty added successfully");

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

    } catch (error) {
      console.error(error);
      alert("Error adding faculty");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <TopBar />
      <main className="flex-1 lg:ml-[240px] overflow-x-hidden">
        <div className="p-6 pt-16 lg:pt-14">
          <div className="max-w-4xl mx-auto">
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

            <div className="border border-gray-100 p-6 bg-white">
              {!isAdmin() ? (
                <div className="text-gray-700">
                  <h2 className="text-xl font-semibold mb-2">Unauthorized</h2>
                  <p>You must be an admin to add faculty.</p>
                </div>
              ) : (
                <>
                  {/* If admin, show the form only when showForm is true. Toggle via top-right button. */}
                  {showForm ? (
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

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
          Add Faculty
        </button>

      </form>
                    ) : (
                      <div className="text-gray-600">Click <span className="text-blue-600 font-medium">Add Faculty</span> at the top-right to open the form.</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  export default FacultyByDepartment;