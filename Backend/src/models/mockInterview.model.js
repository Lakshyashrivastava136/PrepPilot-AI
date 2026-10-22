const mongoose = require("mongoose")

const mockQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: [ "technical", "behavioral" ],
        required: true
    },
    intention: {
        type: String
    },
    userAnswer: {
        type: String,
        default: ""
    },
    score: {
        type: Number,
        min: 0,
        max: 10
    },
    feedback: {
        type: String
    },
    improvedAnswer: {
        type: String
    },
    answered: {
        type: Boolean,
        default: false
    }
}, {
    _id: false
})

const mockInterviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    title: {
        type: String
    },
    questions: [ mockQuestionSchema ],
    status: {
        type: String,
        enum: [ "in_progress", "completed" ],
        default: "in_progress"
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
})

const mockInterviewModel = mongoose.model("MockInterview", mockInterviewSchema)

module.exports = mockInterviewModel