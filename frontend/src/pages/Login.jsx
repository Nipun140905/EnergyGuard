import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && user) {
            if (user.building_id === 'pending') {
                navigate('/select-building')
            } else {
                navigate('/dashboard')
            }
        }
    }, [user, loading, navigate])

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google'
    }

    const error = new URLSearchParams(location.search).get('error')

    return (
        <div className="page-enter" style={{
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2.8rem',
                        fontWeight: 800,
                        marginBottom: '8px',
                    }}>
                        EnergyGuard
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.95rem' }}>
                        Smart building anomaly detection
                    </p>
                </div>

                <div className="card" style={{ padding: '40px', textAlign: 'center' }}>

                    {error && (
                        <div style={{
                            backgroundColor: 'rgba(85, 31, 34, 0.2)',
                            border: '1px solid var(--color-accent)',
                            borderRadius: '4px',
                            padding: '12px 16px',
                            marginBottom: '28px',
                            color: 'var(--color-text)',
                            fontSize: '0.875rem',
                        }}>
                            Authentication failed. Please try again.
                        </div>
                    )}

                    <p style={{
                        color: 'var(--color-muted)',
                        fontSize: '0.9rem',
                        marginBottom: '32px',
                        lineHeight: 1.6,
                    }}>
                        Sign in to access your building dashboard and anomaly detection pipeline.
                    </p>

                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            width: '100%',
                            padding: '14px 24px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            fontFamily: 'var(--font-body)',
                            backgroundColor: '#ffffff',
                            color: '#1a1a1a',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.92'
                            e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p style={{
                        color: 'var(--color-muted)',
                        fontSize: '0.78rem',
                        marginTop: '24px',
                        lineHeight: 1.5,
                    }}>
                        By continuing, you agree to EnergyGuard's terms of use.
                        Your Google account email will be used to identify your account.
                    </p>
                </div>

                <p style={{ textAlign: 'center', marginTop: '24px' }}>
                    <a href="/" style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>
                        ← Back to Home
                    </a>
                </p>

            </div>
        </div>
    )
}

export default Login