const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")
const atsController = require("../controllers/ats.controller")
const { aiLimiter } = require("../middlewares/rateLimit.middleware")

const atsRouter = express.Router()

/**
 * @route POST /api/ats/
 * @description analyze a resume pdf against a job description and return ATS score and suggestions
 * @access private
 */
atsRouter.post("/", authMiddleware.authUser, aiLimiter, upload.single("resume"), atsController.analyzeAtsController)

module.exports = atsRouter