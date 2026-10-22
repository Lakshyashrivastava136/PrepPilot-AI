const mockInterviewModel = require("../models/mockInterview.model")
const interviewReportModel = require("../models/interviewReport.model")
const { evaluateAnswer } = require("../services/ai.service")


/**
 * @description Start a mock interview using the questions of an existing interview report.
 */
async function startMockInterviewController(req, res) {
    try {
        const { interviewReportId } = req.body

        if (!interviewReportId) {
            return res.status(400).json({
                message: "interviewReportId is required."
            })
        }

        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })

        if (!report) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const technical = report.technicalQuestions.slice(0, 3).map(q => ({
            question: q.question,
            intention: q.intention,
            type: "technical"
        }))

        const behavioral = report.behavioralQuestions.slice(0, 2).map(q => ({
            question: q.question,
            intention: q.intention,
            type: "behavioral"
        }))

        const questions = [ ...technical, ...behavioral ]

        if (questions.length === 0) {
            return res.status(400).json({
                message: "This report has no questions to practice."
            })
        }

        const mockInterview = await mockInterviewModel.create({
            user: req.user.id,
            interviewReport: report._id,
            title: report.title,
            questions
        })

        res.status(201).json({
            message: "Mock interview started.",
            mockInterview
        })
    } catch (err) {
        console.error("Start mock interview failed:", err)
        res.status(500).json({
            message: "Failed to start mock interview."
        })
    }
}


/**
 * @description Submit an answer for one question and get AI score + feedback.
 */
async function answerMockQuestionController(req, res) {
    try {
        const { id } = req.params
        const { questionIndex, answer } = req.body

        if (typeof questionIndex !== "number" || !answer || !answer.trim()) {
            return res.status(400).json({
                message: "questionIndex and a non-empty answer are required."
            })
        }

        const mockInterview = await mockInterviewModel.findOne({ _id: id, user: req.user.id })

        if (!mockInterview) {
            return res.status(404).json({
                message: "Mock interview not found."
            })
        }

        const question = mockInterview.questions[ questionIndex ]

        if (!question) {
            return res.status(400).json({
                message: "Invalid question index."
            })
        }

        if (question.answered) {
            return res.status(400).json({
                message: "This question is already answered."
            })
        }

        const evaluation = await evaluateAnswer({
            jobTitle: mockInterview.title,
            question: question.question,
            intention: question.intention,
            answer
        })

        question.userAnswer = answer
        question.score = Math.max(0, Math.min(10, Math.round(evaluation.score)))
        question.feedback = evaluation.feedback
        question.improvedAnswer = evaluation.improvedAnswer
        question.answered = true

        const allAnswered = mockInterview.questions.every(q => q.answered)

        if (allAnswered) {
            const total = mockInterview.questions.reduce((sum, q) => sum + q.score, 0)
            mockInterview.overallScore = Math.round((total / (mockInterview.questions.length * 10)) * 100)
            mockInterview.status = "completed"
        }

        await mockInterview.save()

        res.status(200).json({
            message: "Answer evaluated.",
            result: {
                score: question.score,
                feedback: question.feedback,
                improvedAnswer: question.improvedAnswer
            },
            mockInterview
        })
    } catch (err) {
        console.error("Answer evaluation failed:", err)
        res.status(500).json({
            message: "Failed to evaluate answer. Please try again."
        })
    }
}


/**
 * @description Get one mock interview (own only).
 */
async function getMockInterviewController(req, res) {
    const { id } = req.params

    const mockInterview = await mockInterviewModel.findOne({ _id: id, user: req.user.id })

    if (!mockInterview) {
        return res.status(404).json({
            message: "Mock interview not found."
        })
    }

    res.status(200).json({
        message: "Mock interview fetched successfully.",
        mockInterview
    })
}


/**
 * @description Get all mock interviews of the logged in user (latest first).
 */
async function getAllMockInterviewsController(req, res) {
    const mockInterviews = await mockInterviewModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("title status overallScore createdAt")

    res.status(200).json({
        message: "Mock interviews fetched successfully.",
        mockInterviews
    })
}


module.exports = {
    startMockInterviewController,
    answerMockQuestionController,
    getMockInterviewController,
    getAllMockInterviewsController
}