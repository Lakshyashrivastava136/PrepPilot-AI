const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const analyticsController = require("../controllers/analytics.controller")

const analyticsRouter = express.Router()

/**
 * @route GET /api/analytics/
 * @description get progress analytics of the logged in user
 * @access private
 */
analyticsRouter.get("/", authMiddleware.authUser, analyticsController.getAnalyticsController)

module.exports = analyticsRouter