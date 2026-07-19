import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'
import DashboardNavbar from '../components/dashboard/DashboardNavbar'
import StreamTabs from '../components/dashboard/StreamTabs'
import KPICards from '../components/dashboard/KPICards'
import EnergyChart from '../components/dashboard/EnergyChart'
import AnomalyTable from '../components/dashboard/AnomalyTable'

const Dashboard = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth()

    const [streams, setStreams] = useState({})
    const [activeStream, setActiveStream] = useState('')
    const [loading, setLoading] = useState(true)
    const [analysing, setAnalysing] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchCached() }, [])

    const fetchCached = async () => {
        setLoading(true)
        try {
            const res = await api.get('/buildings/my')
            if (res.data.cache && res.data.cache.length > 0) {
                const streamMap = {}
                res.data.cache.forEach(entry => { streamMap[entry.stream] = entry.results })
                setStreams(streamMap)
                setActiveStream(Object.keys(streamMap)[0])
            } else {
                await runAnalysis()
            }
        } catch { setError('Failed to load building data') }
        finally { setLoading(false) }
    }

    const runAnalysis = async () => {
        setAnalysing(true)
        setError('')
        try {
            const res = await api.post('/buildings/analyse')
            setStreams(res.data.streams)
            setActiveStream(Object.keys(res.data.streams)[0])
        } catch { setError('Analysis failed. Make sure the ML API is running.') }
        finally { setAnalysing(false) }
    }

    const handleLogout = async () => { await logout(); navigate('/') }

    const handleDeleteAccount = async () => {
        try {
            await api.delete('/auth/delete-account')
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account.')
            throw err
        }
    }

    const currentStream = streams[activeStream]

    if (loading || analysing) {
        return (
            <div style={{
                minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '24px',
            }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className="anomaly-pulse" style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            backgroundColor: 'var(--color-accent)',
                            animationDelay: `${i * 0.2}s`,
                        }} />
                    ))}
                </div>
                <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                    {analysing ? 'Running anomaly detection pipeline...' : 'Loading dashboard...'}
                </p>
                {analysing && (
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>
                        This may take 20–30 seconds on first run
                    </p>
                )}
            </div>
        )
    }

    return (
        <div className="page-enter" style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-primary)',
            paddingBottom: '60px',
        }}>
            <DashboardNavbar
                user={user}
                onLogout={handleLogout}
                onDeleteAccount={handleDeleteAccount}
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '32px', flexWrap: 'wrap', gap: '16px',
                }}>
                    <div>
                        <h2 style={{
                            fontFamily: 'var(--font-heading)', fontSize: '1.8rem',
                            fontWeight: 700, marginBottom: '4px',
                        }}>
                            {user?.building_id}
                        </h2>
                        <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', margin: 0 }}>
                            Anomaly Detection Dashboard
                        </p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={runAnalysis}
                        disabled={analysing}
                        style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                    >
                        Refresh Analysis
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(85, 31, 34, 0.2)',
                        border: '1px solid var(--color-accent)',
                        borderRadius: '4px', padding: '12px 16px',
                        marginBottom: '24px', color: 'var(--color-text)', fontSize: '0.875rem',
                    }}>
                        {error}
                    </div>
                )}

                <StreamTabs
                    streams={streams}
                    activeStream={activeStream}
                    onStreamChange={setActiveStream}
                />

                {currentStream && (
                    <div className="stream-tab-content">
                        <KPICards kpi={currentStream.kpi} />
                        <EnergyChart
                            streamData={currentStream}
                            streamName={activeStream}
                        />
                        <AnomalyTable
                            anomalies={currentStream.anomalies}
                            streamName={activeStream}
                        />
                    </div>
                )}
            </div>

            <footer className="eg-footer">
                EnergyGuard. Smart Building Anomaly Detection. Built on BDGP2 dataset. For portfolio and research purposes only.
            </footer>
        </div>
    )
}

export default Dashboard