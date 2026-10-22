const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const mockController = require("../controllers/mock.controller")
const { aiLimiter } = require("../middlewares/rateLimit.middleware")

const mockRouter = express.Router()

/**
 * @route POST /api/mock/start
 * @description start a mock interview from an existing interview report
 * @access private
 */
mockRouter.post("/start", authMiddleware.authUser, mockController.startMockInterviewController)

/**
 * @route POST /api/mock/:id/answer
 * @description submit an answer for a question and get AI feedback
 * @access private
 */
mockRouter.post("/:id/answer", authMiddleware.authUser, aiLimiter, mockController.answerMockQuestionController)

/**
 * @route GET /api/mock/:id
 * @description get one mock interview
 * @access private
 */
mockRouter.get("/:id", authMiddleware.authUser, mockController.getMockInterviewController)

/**
 * @route GET /api/mock/
 * @description get all mock interviews of logged in user
 * @access private
 */
mockRouter.get("/", authMiddleware.authUser, mockController.getAllMockInterviewsController)

module.exports = mockRouter