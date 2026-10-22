const rateLimit = require("express-rate-limit")

/**
 * General limiter for all API routes.
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests. Please try again later." }
})

/**
 * Strict limiter for login/register to slow down brute-force attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts. Please try again in 15 minutes." }
})

/**
 * Limiter for expensive AI endpoints so nobody can burn the Gemini quota.
 */
const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "AI usage limit reached. Please try again in an hour." }
})

module.exports = { apiLimiter, authLimiter, aiLimiter }