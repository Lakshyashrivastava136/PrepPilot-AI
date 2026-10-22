const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const { apiLimiter, authLimiter } = require("./middlewares/rateLimit.middleware")

const app = express()

// Needed so secure cookies and rate limiting work behind Render's proxy
app.set("trust proxy", 1)

app.use(helmet())
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

/* rate limiting */
app.use("/api", apiLimiter)
app.use("/api/auth/login", authLimiter)
app.use("/api/auth/register", authLimiter)

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const mockRouter = require("./routes/mock.routes")
const analyticsRouter = require("./routes/analytics.routes")
const atsRouter = require("./routes/ats.routes")


/* health check (used by hosting platforms) */
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/mock", mockRouter)
app.use("/api/analytics", analyticsRouter)
app.use("/api/ats", atsRouter)



module.exports = app