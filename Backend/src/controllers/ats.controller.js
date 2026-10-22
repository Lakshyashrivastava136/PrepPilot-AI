const pdfParse = require("pdf-parse")
const { analyzeAtsResume } = require("../services/ai.service")


/**
 * @description Analyze an uploaded resume PDF against a job description (ATS check).
 */
async function analyzeAtsController(req, res) {
    try {
        const { jobDescription } = req.body

        if (!req.file) {
            return res.status(400).json({
                message: "Please upload your resume as a PDF."
            })
        }

        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({
                message: "Only PDF resumes are supported."
            })
        }

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            })
        }

        const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
        const resumeText = parsed.text

        if (!resumeText || !resumeText.trim()) {
            return res.status(400).json({
                message: "Could not read any text from this PDF. It may be a scanned image."
            })
        }

        const analysis = await analyzeAtsResume({
            resume: resumeText,
            jobDescription
        })

        res.status(200).json({
            message: "ATS analysis completed.",
            analysis
        })
    } catch (err) {
        console.error("ATS analysis failed:", err)
        res.status(500).json({
            message: "Failed to analyze resume. Please try again."
        })
    }
}

module.exports = { analyzeAtsController }