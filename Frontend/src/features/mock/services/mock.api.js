import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

const getErrorMessage = (err) => {
    return err.response?.data?.message || "Something went wrong. Please try again."
}

export const startMockInterview = async ({ interviewReportId }) => {
    try {
        const response = await api.post("/api/mock/start", { interviewReportId })
        return response.data
    } catch (err) {
        throw new Error(getErrorMessage(err))
    }
}

export const getMockInterview = async (id) => {
    try {
        const response = await api.get(`/api/mock/${id}`)
        return response.data
    } catch (err) {
        throw new Error(getErrorMessage(err))
    }
}

export const answerMockQuestion = async (id, { questionIndex, answer }) => {
    try {
        const response = await api.post(`/api/mock/${id}/answer`, { questionIndex, answer })
        return response.data
    } catch (err) {
        throw new Error(getErrorMessage(err))
    }
}