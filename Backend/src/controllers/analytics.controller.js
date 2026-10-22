const mongoose = require("mongoose")
const interviewReportModel = require("../models/interviewReport.model")
const mockInterviewModel = require("../models/mockInterview.model")


/**
 * @description Get progress analytics for the logged in user.
 */
async function getAnalyticsController(req, res) {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.id)

        // Report stats
        const [ reportStats ] = await interviewReportModel.aggregate([
            { $match: { user: userId } },
            {
                $group: {
                    _id: null,
                    totalReports: { $sum: 1 },
                    avgMatchScore: { $avg: "$matchScore" }
                }
            }
        ])

        // Completed mock interviews (oldest first, for the trend chart)
        const completedMocks = await mockInterviewModel
            .find({ user: userId, status: "completed" })
            .sort({ createdAt: 1 })
            .select("title overallScore createdAt")

        const totalMocks = await mockInterviewModel.countDocuments({ user: userId })

        const scores = completedMocks.map(m => m.overallScore)

        const averageMockScore = scores.length
            ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
            : 0

        const bestMockScore = scores.length ? Math.max(...scores) : 0

        const scoreTrend = completedMocks.slice(-10).map(m => ({
            id: m._id,
            title: m.title,
            score: m.overallScore,
            date: m.createdAt
        }))

        // Average score per question type (technical / behavioral)
        const typeStats = await mockInterviewModel.aggregate([
            { $match: { user: userId, status: "completed" } },
            { $unwind: "$questions" },
            {
                $group: {
                    _id: "$questions.type",
                    avgScore: { $avg: "$questions.score" },
                    count: { $sum: 1 }
                }
            }
        ])

        const byType = { technical: null, behavioral: null }

        typeStats.forEach(t => {
            byType[ t._id ] = Math.round(t.avgScore * 10) // convert 0-10 to percent
        })

        // Recent mock interviews (any status)
        const recentMocks = await mockInterviewModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title status overallScore createdAt")

        res.status(200).json({
            message: "Analytics fetched successfully.",
            analytics: {
                totalReports: reportStats ? reportStats.totalReports : 0,
                avgMatchScore: reportStats ? Math.round(reportStats.avgMatchScore) : 0,
                totalMocks,
                completedMocks: completedMocks.length,
                averageMockScore,
                bestMockScore,
                scoreTrend,
                byType,
                recentMocks
            }
        })
    } catch (err) {
        console.error("Analytics failed:", err)
        res.status(500).json({
            message: "Failed to fetch analytics."
        })
    }
}

module.exports = { getAnalyticsController }