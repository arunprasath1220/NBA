import React, { useEffect, useState } from 'react'
import Navbar from "../components/Navbar"
import TopBar from "../components/TopBar"
import { useNavigate } from 'react-router-dom'
import useAuthStore from "../store/authStore"

const API_URL = "http://localhost:8000/api"

function Criteria1() {
    const navigate = useNavigate()
    const { isAuthenticated, isLoading } = useAuthStore()

    const [departments, setDepartments] = useState([])
    const [programs, setPrograms] = useState([])
    const [selectedProgram, setSelectedProgram] = useState("")
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState(null)
    const [editing, setEditing] = useState(null)
    const [editVision, setEditVision] = useState("")
    const [editMission, setEditMission] = useState([])

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate("/login")
        }
    }, [isAuthenticated, isLoading, navigate])

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true)
            try {
                const allRes = await fetch(`${API_URL}/criteria1/visions-missions`)
                const allData = await allRes.json()
                if (allData.success && Array.isArray(allData.data)) {
                    setPrograms(allData.data)
                }

                let url = `${API_URL}/criteria1/visions-missions`
                if (selectedProgram) {
                    url += `?programId=${selectedProgram}`
                }
                const res = await fetch(url)
                const data = await res.json()
                if (data.success && Array.isArray(data.data)) {
                    setDepartments(data.data)
                } else {
                    setDepartments([])
                    if (!data.success) setError(data.error || "Unable to load content")
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoadingData(false)
            }
        }
        fetchData()
    }, [selectedProgram])

    const handleProgramChange = (e) => {
        setSelectedProgram(e.target.value)
    }

    const handleEdit = (dept) => {
        setEditing(dept.programId || dept.ProgramID)
        setEditVision(dept.vision || "")
        setEditMission(dept.mission || [])
    }

    const handleSave = async () => {
        try {
            const res = await fetch(`${API_URL}/criteria1/visions-missions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    programId: editing,
                    vision: editVision,
                    mission: editMission,
                }),
            })
            const data = await res.json()
            if (data.success) {
                setEditing(null)
                setEditVision("")
                setEditMission([])
                setSelectedProgram("")
            } else {
                setError(data.error || "Failed to save changes")
            }
        } catch (err) {
            setError(err.message)
        }
    }

    if (isLoading || loadingData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-10 h-10 border-[3px] border-gray-300 border-t-[#0095ff] rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <div>
            <Navbar />
            <TopBar />
            <div className="p-4 lg:ml-[240px]">
                {error && <p className="text-red-500">{error}</p>}

                <div className="mb-6">
                    <label className="block mb-1 font-semibold">Department</label>
                    <select
                        className="border rounded px-2 py-1"
                        value={selectedProgram}
                        onChange={handleProgramChange}
                    >
                        <option value="">All Departments</option>
                        {programs.map((p) => (
                            <option key={p.programId || p.ProgramID || p.id} value={p.programId || p.ProgramID || p.id}>
                                {p.departmentName || p.DepartmentName || p.programName || p.ProgramName || p.name}
                            </option>
                        ))}
                    </select>
                </div>

                {departments.length === 0 ? (
                    <p>No department data available.</p>
                ) : (
                    departments.map((dept, idx) => (
                        <div key={dept.programId || dept.ProgramID || idx} className="mb-8">
                            <h2 className="text-2xl font-bold mb-2">{dept.departmentName || dept.DepartmentName || dept.programName || dept.ProgramName || "Department"}</h2>
                            {editing === (dept.programId || dept.ProgramID) ? (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Edit Vision</h3>
                                    <textarea
                                        className="border rounded w-full p-2 mb-4"
                                        value={editVision}
                                        onChange={(e) => setEditVision(e.target.value)}
                                    />
                                    <h3 className="text-xl font-semibold mb-2">Edit Mission</h3>
                                    {editMission.map((m, i) => (
                                        <input
                                            key={i}
                                            className="border rounded w-full p-2 mb-2"
                                            value={m}
                                            onChange={(e) => {
                                                const newMission = [...editMission]
                                                newMission[i] = e.target.value
                                                setEditMission(newMission)
                                            }}
                                        />
                                    ))}
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="bg-gray-500 text-white px-4 py-2 rounded"
                                        onClick={() => setEditing(null)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-xl font-semibold mb-2">Vision</h3>
                                    <p className="mb-4">{dept.vision || "Not available"}</p>
                                    <h3 className="text-xl font-semibold mb-2">Mission</h3>
                                    {dept.mission && dept.mission.length ? (
                                        <ul className="list-disc ml-6">
                                            {dept.mission.map((m, i) => (
                                                <li key={i}>{m}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Not available</p>
                                    )}
                                    <button
                                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                                        onClick={() => handleEdit(dept)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Criteria1