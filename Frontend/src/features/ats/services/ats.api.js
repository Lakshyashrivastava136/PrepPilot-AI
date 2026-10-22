import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    withCredentials: true,
})

export const analyzeResume = async ({ resumeFile, jobDescription }) => {
    try {
        const formData = new FormData()
        formData.append("resume", resumeFile)
        formData.append("jobDescription", jobDescription)

        const response = await api.post("/api/ats", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })

        return response.data.analysis
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to analyze resume. Please try again.")
    }
}