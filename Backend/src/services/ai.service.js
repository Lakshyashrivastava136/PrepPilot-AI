const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const PRIMARY_MODEL = "gemini-3-flash-preview"
const FALLBACK_MODEL = "gemini-2.5-flash"

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Calls Gemini with retry and a fallback model.
 * Retries only on temporary errors (429, 500, 503, 504).
 */
async function generateContentWithRetry({ contents, config }) {
    const attempts = [
        { model: PRIMARY_MODEL, delay: 0 },
        { model: PRIMARY_MODEL, delay: 1500 },
        { model: FALLBACK_MODEL, delay: 1500 },
    ]

    let lastError

    for (const attempt of attempts) {
        if (attempt.delay) {
            await sleep(attempt.delay)
        }

        try {
            return await ai.models.generateContent({
                model: attempt.model,
                contents,
                config
            })
        } catch (err) {
            lastError = err

            const isTemporary = [ 429, 500, 503, 504 ].includes(err.status)

            if (!isTemporary) {
                throw err
            }

            console.warn(`Gemini error ${err.status} on ${attempt.model}, retrying...`)
        }
    }

    throw lastError
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema),
        }
    })

    return JSON.parse(response.text)


}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    const pdfBuffer = await page.pdf({
        format: "A4", margin: {
            top: "20mm",
            bottom: "20mm",
            left: "15mm",
            right: "15mm"
        }
    })

    await browser.close()

    return pdfBuffer
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like puppeteer")
    })

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(resumePdfSchema),
        }
    })


    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer

}


const answerEvaluationSchema = z.object({
    score: z.number().describe("Score from 0 to 10 for the candidate's answer. 0 means completely wrong or empty, 10 means excellent."),
    feedback: z.string().describe("Honest, specific feedback on the answer: what was good, what was missing or wrong. 2-4 sentences."),
    improvedAnswer: z.string().describe("A strong sample answer to this question that the candidate can learn from. Keep it concise and natural.")
})

async function evaluateAnswer({ jobTitle, question, intention, answer }) {

    const prompt = `You are a strict but fair interviewer for the role: ${jobTitle}.
                        Interview question: ${question}
                        What the interviewer wants to find out: ${intention}
                        Candidate's answer: ${answer}

                        Evaluate the candidate's answer. Be honest, do not inflate the score.
                        If the answer is empty, irrelevant or just a few meaningless words, give a score of 0 or 1.`

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(answerEvaluationSchema),
        }
    })

    return JSON.parse(response.text)
}


const atsAnalysisSchema = z.object({
    atsScore: z.number().describe("Overall ATS compatibility score from 0 to 100, based on keyword match with the job description, presence of standard sections, clarity and quantified achievements."),
    summary: z.string().describe("2-3 sentence honest overall assessment of how well this resume fits the job description for an ATS and a recruiter."),
    matchedKeywords: z.array(z.string()).describe("Important keywords or skills from the job description that appear in the resume."),
    missingKeywords: z.array(z.string()).describe("Important keywords or skills from the job description that are missing from the resume."),
    sections: z.array(z.object({
        name: z.string().describe("Section name, e.g. Contact Info, Summary, Skills, Experience, Projects, Education"),
        present: z.boolean().describe("Whether this section is present in the resume"),
        comment: z.string().describe("One short sentence of feedback about this section")
    })).describe("Check of the standard resume sections"),
    formattingIssues: z.array(z.string()).describe("Text-level problems like missing quantified achievements, inconsistent dates, very long bullet points, resume too long or too short. Do not comment on visual layout since only plain text is available."),
    suggestions: z.array(z.object({
        priority: z.enum([ "high", "medium", "low" ]).describe("How important this improvement is"),
        text: z.string().describe("A specific, actionable improvement for the resume")
    })).describe("Top 5 to 8 specific improvements ordered by importance")
})

async function analyzeAtsResume({ resume, jobDescription }) {

    const prompt = `You are an ATS (Applicant Tracking System) and an experienced technical recruiter.
                        Analyze the resume below against the job description.
                        Be honest and strict, do not inflate the score.
                        You only have the plain text of the resume, so do not make claims about fonts, colors or visual layout.

                        Resume:
                        ${resume}

                        Job Description:
                        ${jobDescription}`

    const response = await generateContentWithRetry({
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(atsAnalysisSchema),
        }
    })

    return JSON.parse(response.text)
}

module.exports = { generateInterviewReport, generateResumePdf, evaluateAnswer, analyzeAtsResume }