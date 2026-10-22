import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import '../style/ats.scss'
import { analyzeResume } from '../services/ats.api'

const ringColor = (score) => score >= 75 ? '#3fb950' : score >= 50 ? '#e3b341' : '#ff6b6b'

const AtsAnalyzer = () => {

    const navigate = useNavigate()
    const [ jobDescription, setJobDescription ] = useState("")
    const [ resumeFile, setResumeFile ] = useState(null)
    const [ loading, setLoading ] = useState(false)
    const [ error, setError ] = useState("")
    const [ analysis, setAnalysis ] = useState(null)

    const handleAnalyze = async () => {
        setError("")

        if (!resumeFile) {
            setError("Please choose your resume PDF.")
            return
        }

        if (!jobDescription.trim()) {
            setError("Please paste the job description.")
            return
        }

        setLoading(true)
        try {
            const result = await analyzeResume({ resumeFile, jobDescription })
            setAnalysis(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setAnalysis(null)
        setError("")
    }

    return (
        <main className='ats-page'>
            <div className='ats-container'>

                <div className='ats-header'>
                    <h1>📄 ATS Resume Analyzer</h1>
                    <button className='ats-btn' onClick={() => navigate('/')}>← Back to Home</button>
                </div>

                {!analysis ? (
                    <div className='ats-card'>
                        <label className='ats-label'>Resume (PDF only, max 3MB)</label>
                        <input
                            className='ats-file'
                            type='file'
                            accept='.pdf'
                            onChange={(e) => setResumeFile(e.target.files[ 0 ] || null)}
                            disabled={loading}
                        />

                        <label className='ats-label'>Job Description</label>
                        <textarea
                            className='ats-textarea'
                            placeholder='Paste the full job description here...'
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            maxLength={5000}
                            disabled={loading}
                        />

                        {error && <p className='ats-error'>{error}</p>}

                        <button className='ats-btn ats-btn--primary' onClick={handleAnalyze} disabled={loading}>
                            {loading ? "Analyzing your resume..." : "Analyze Resume"}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Score + summary */}
                        <div className='ats-card'>
                            <div className='ats-score-row'>
                                <div
                                    className='ats-ring'
                                    style={{ '--ring-value': analysis.atsScore, '--ring-color': ringColor(analysis.atsScore) }}
                                >
                                    <div className='ats-ring__inner'>{Math.round(analysis.atsScore)}</div>
                                </div>
                                <div>
                                    <h2>ATS Score</h2>
                                    <p className='ats-summary'>{analysis.summary}</p>
                                </div>
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className='ats-card'>
                            <h2>✅ Matched Keywords ({analysis.matchedKeywords.length})</h2>
                            <div className='chip-list'>
                                {analysis.matchedKeywords.length === 0
                                    ? <span className='ats-summary'>No matching keywords found.</span>
                                    : analysis.matchedKeywords.map((k, i) => <span key={i} className='chip chip--match'>{k}</span>)}
                            </div>
                        </div>

                        <div className='ats-card'>
                            <h2>❌ Missing Keywords ({analysis.missingKeywords.length})</h2>
                            <div className='chip-list'>
                                {analysis.missingKeywords.length === 0
                                    ? <span className='ats-summary'>Great, no important keywords missing.</span>
                                    : analysis.missingKeywords.map((k, i) => <span key={i} className='chip chip--missing'>{k}</span>)}
                            </div>
                        </div>

                        {/* Sections */}
                        <div className='ats-card'>
                            <h2>Resume Sections</h2>
                            {analysis.sections.map((s, i) => (
                                <div className='section-item' key={i}>
                                    <span className={`section-item__icon ${s.present ? 'green' : 'red'}`}>{s.present ? '✓' : '✗'}</span>
                                    <div>
                                        <div className='section-item__name'>{s.name}</div>
                                        <div className='section-item__comment'>{s.comment}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Formatting issues */}
                        {analysis.formattingIssues.length > 0 && (
                            <div className='ats-card'>
                                <h2>⚠️ Issues Found</h2>
                                <ul className='issue-list'>
                                    {analysis.formattingIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Suggestions */}
                        <div className='ats-card'>
                            <h2>💡 Suggested Improvements</h2>
                            {analysis.suggestions.map((s, i) => (
                                <div className='suggestion-item' key={i}>
                                    <span className={`priority-tag priority-tag--${s.priority}`}>{s.priority}</span>
                                    <span>{s.text}</span>
                                </div>
                            ))}
                        </div>

                        <button className='ats-btn ats-btn--primary' onClick={handleReset}>Analyze Another Resume</button>
                    </>
                )}

            </div>
        </main>
    )
}

export default AtsAnalyzer