import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

export const getAnalytics = async () => {
    try {
        const response = await api.get("/api/analytics")
        return response.data.analytics
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to load analytics.")
    }
}