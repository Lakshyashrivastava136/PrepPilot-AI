import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import '../style/mock.scss'
import { getMockInterview, answerMockQuestion } from '../services/mock.api'

const scoreClass = (score) => score >= 8 ? 'score--high' : score >= 5 ? 'score--mid' : 'score--low'
const overallClass = (score) => score >= 80 ? 'score--high' : score >= 50 ? 'score--mid' : 'score--low'

const MockInterview = () => {

    const { mockId } = useParams()
    const navigate = useNavigate()

    const [ mock, setMock ] = useState(null)
    const [ current, setCurrent ] = useState(0)
    const [ answer, setAnswer ] = useState("")
    const [ result, setResult ] = useState(null)
    const [ submitting, setSubmitting ] = useState(false)
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getMockInterview(mockId)
                setMock(data.mockInterview)
                const firstUnanswered = data.mockInterview.questions.findIndex(q => !q.answered)
                setCurrent(firstUnanswered === -1 ? 0 : firstUnanswered)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [ mockId ])

    const handleSubmit = async () => {
        setError("")
        setSubmitting(true)
        try {
            const data = await answerMockQuestion(mockId, { questionIndex: current, answer })
            setResult(data.result)
            setMock(data.mockInterview)
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleNext = () => {
        setResult(null)
        setAnswer("")
        if (mock.status !== "completed") {
            setCurrent(c => c + 1)
        }
    }

    if (loading) {
        return (
            <main className='mock-page'>
                <h1>Loading mock interview...</h1>
            </main>
        )
    }

    if (!mock) {
        return (
            <main className='mock-page'>
                <div className='mock-container'>
                    <p className='mock-error'>{error || "Mock interview not found."}</p>
                    <button className='mock-btn' onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </main>
        )
    }

    // ---------- Final summary ----------
    if (mock.status === "completed" && !result) {
        return (
            <main className='mock-page'>
                <div className='mock-container'>
                    <h1 className='mock-title'>Mock Interview Result · {mock.title}</h1>

                    <div className='mock-card'>
                        <p className='mock-label' style={{ textAlign: "center" }}>Overall Score</p>
                        <div className={`mock-summary-score ${overallClass(mock.overallScore)}`}>
                            {mock.overallScore}%
                        </div>
                    </div>

                    {mock.questions.map((q, i) => (
                        <div className='mock-card' key={i}>
                            <span className='mock-tag'>{q.type}</span>
                            <p className='mock-question'>Q{i + 1}. {q.question}</p>
                            <div className={`mock-score ${scoreClass(q.score)}`}>{q.score}<small> / 10</small></div>

                            <p className='mock-label'>Your answer</p>
                            <p className='mock-text'>{q.userAnswer}</p>

                            <p className='mock-label'>Feedback</p>
                            <p className='mock-text'>{q.feedback}</p>

                            <p className='mock-label'>Better answer</p>
                            <p className='mock-text'>{q.improvedAnswer}</p>
                        </div>
                    ))}

                    <button className='mock-btn' onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </main>
        )
    }

    // ---------- Question view ----------
    const question = mock.questions[ current ]
    const total = mock.questions.length
    const answeredCount = mock.questions.filter(q => q.answered).length

    return (
        <main className='mock-page'>
            <div className='mock-container'>
                <h1 className='mock-title'>Mock Interview · {mock.title}</h1>

                <div className='mock-card'>
                    <p className='mock-progress-text'>Question {current + 1} of {total}</p>
                    <div className='mock-progress-bar'>
                        <div style={{ width: `${(answeredCount / total) * 100}%` }} />
                    </div>

                    <span className='mock-tag'>{question.type}</span>
                    <h2 className='mock-question'>{question.question}</h2>

                    {!result ? (
                        <>
                            <textarea
                                className='mock-textarea'
                                placeholder='Type your answer here as you would say it in a real interview...'
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                maxLength={3000}
                                disabled={submitting}
                            />
                            {error && <p className='mock-error'>{error}</p>}
                            <button
                                className='mock-btn'
                                onClick={handleSubmit}
                                disabled={submitting || !answer.trim()}
                            >
                                {submitting ? "AI is evaluating..." : "Submit Answer"}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={`mock-score ${scoreClass(result.score)}`}>{result.score}<small> / 10</small></div>

                            <p className='mock-label'>Feedback</p>
                            <p className='mock-text'>{result.feedback}</p>

                            <p className='mock-label'>Better answer</p>
                            <p className='mock-text'>{result.improvedAnswer}</p>

                            <div style={{ marginTop: "1.5rem" }}>
                                <button className='mock-btn' onClick={handleNext}>
                                    {mock.status === "completed" ? "See Final Results" : "Next Question"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}

export default MockInterview