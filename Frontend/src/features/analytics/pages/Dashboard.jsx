import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import '../style/dashboard.scss'
import { getAnalytics } from '../services/analytics.api'

const scoreClass = (score) => score >= 80 ? 'score--high' : score >= 50 ? 'score--mid' : 'score--low'

const Dashboard = () => {

    const navigate = useNavigate()
    const [ data, setData ] = useState(null)
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState("")

    useEffect(() => {
        const load = async () => {
            try {
                const analytics = await getAnalytics()
                setData(analytics)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <main className='dashboard-page'>
                <h1>Loading dashboard...</h1>
            </main>
        )
    }

    if (!data) {
        return (
            <main className='dashboard-page'>
                <div className='dashboard-container'>
                    <p style={{ color: "#ff6b6b" }}>{error || "Could not load dashboard."}</p>
                    <button className='dash-btn' onClick={() => navigate('/')}>Back to Home</button>
                </div>
            </main>
        )
    }

    return (
        <main className='dashboard-page'>
            <div className='dashboard-container'>

                <div className='dashboard-header'>
                    <h1>📊 My Progress</h1>
                    <button className='dash-btn' onClick={() => navigate('/')}>← Back to Home</button>
                </div>

                {/* Stat cards */}
                <div className='stat-grid'>
                    <div className='stat-card'>
                        <div className='stat-card__value'>{data.totalReports}</div>
                        <div className='stat-card__label'>Reports created</div>
                    </div>
                    <div className='stat-card'>
                        <div className='stat-card__value'>{data.completedMocks}</div>
                        <div className='stat-card__label'>Mock interviews done</div>
                    </div>
                    <div className='stat-card'>
                        <div className={`stat-card__value ${data.completedMocks ? scoreClass(data.averageMockScore) : ''}`}>
                            {data.completedMocks ? `${data.averageMockScore}%` : '-'}
                        </div>
                        <div className='stat-card__label'>Average mock score</div>
                    </div>
                    <div className='stat-card'>
                        <div className={`stat-card__value ${data.completedMocks ? scoreClass(data.bestMockScore) : ''}`}>
                            {data.completedMocks ? `${data.bestMockScore}%` : '-'}
                        </div>
                        <div className='stat-card__label'>Best mock score</div>
                    </div>
                </div>

                {/* Score trend */}
                <div className='dash-card'>
                    <h2>Score Trend (last {data.scoreTrend.length || 10} mock interviews)</h2>
                    {data.scoreTrend.length === 0 ? (
                        <p className='dash-empty'>Finish a mock interview to see your progress here.</p>
                    ) : (
                        <>
                            <div className='trend-chart'>
                                {data.scoreTrend.map((t) => (
                                    <div
                                        className='trend-bar-wrap'
                                        key={t.id}
                                        title={`${t.title} - ${t.score}%`}
                                        onClick={() => navigate(`/mock/${t.id}`)}
                                    >
                                        <span className='trend-value'>{t.score}%</span>
                                        <div className='trend-bar' style={{ height: `${t.score}%` }} />
                                    </div>
                                ))}
                            </div>
                            <div className='trend-labels'>
                                {data.scoreTrend.map((t) => (
                                    <span key={t.id}>{new Date(t.date).toLocaleDateString()}</span>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Technical vs behavioral */}
                <div className='dash-card'>
                    <h2>Technical vs Behavioral</h2>
                    {data.byType.technical === null && data.byType.behavioral === null ? (
                        <p className='dash-empty'>No data yet.</p>
                    ) : (
                        [ [ 'Technical', data.byType.technical ], [ 'Behavioral', data.byType.behavioral ] ].map(([ label, value ]) => (
                            <div className='type-row' key={label}>
                                <div className='type-row__top'>
                                    <span>{label}</span>
                                    <span>{value === null ? '-' : `${value}%`}</span>
                                </div>
                                <div className='type-row__track'>
                                    <div style={{ width: `${value || 0}%` }} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent mock interviews */}
                <div className='dash-card'>
                    <h2>Recent Mock Interviews</h2>
                    {data.recentMocks.length === 0 ? (
                        <p className='dash-empty'>No mock interviews yet. Open a report and click "Start Mock Interview".</p>
                    ) : (
                        data.recentMocks.map((m) => (
                            <div className='recent-item' key={m._id} onClick={() => navigate(`/mock/${m._id}`)}>
                                <div>
                                    <div>{m.title}</div>
                                    <div className='recent-item__meta'>
                                        {new Date(m.createdAt).toLocaleDateString()} · {m.status === 'completed' ? 'Completed' : 'In progress'}
                                    </div>
                                </div>
                                <div className={`recent-item__score ${m.status === 'completed' ? scoreClass(m.overallScore) : ''}`}>
                                    {m.status === 'completed' ? `${m.overallScore}%` : 'Resume'}
                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </main>
    )
}

export default Dashboard