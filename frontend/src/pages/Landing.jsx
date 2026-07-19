import { useNavigate } from 'react-router-dom'

const Landing = () => {
    const navigate = useNavigate()

    return (
        <div className="page-enter" style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)' }}>

            {/* Hero Section */}
            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #3d0a0e 0%, #2a0608 20%, #1a0407 40%, #0f0203 65%, #0D0D0E 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 24px',
                textAlign: 'center',
            }}>

                <div style={{ marginBottom: '24px' }}>
                    <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'var(--color-muted)',
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                    }}>
                        Smart Building Intelligence
                    </span>
                </div>

                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                    fontWeight: 800,
                    color: 'var(--color-text)',
                    lineHeight: 1.1,
                    marginBottom: '8px',
                    maxWidth: '800px',
                }}>
                    Energy
                </h1>
                <h1 style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--color-accent), #8B3A3D)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    marginBottom: '32px',
                }}>
                    Guard
                </h1>

                <p style={{
                    color: 'var(--color-muted)',
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    fontWeight: 300,
                    maxWidth: '560px',
                    marginBottom: '16px',
                    lineHeight: 1.7,
                }}>
                    Detect. Explain. Optimize.
                </p>
                <p style={{
                    color: 'var(--color-muted)',
                    fontSize: '0.95rem',
                    fontWeight: 300,
                    maxWidth: '520px',
                    marginBottom: '48px',
                    lineHeight: 1.7,
                }}>
                    Industrial-grade anomaly detection for smart buildings, powered by an ensemble
                    of Isolation Forest, LOF, and Robust Covariance with majority voting.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => navigate('/login')}
                        style={{
                            padding: '14px 48px',
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '4px',
                            boxShadow: '0 0 24px rgba(78, 0, 0, 0.5)',
                            letterSpacing: '0.05em',
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div style={{
                backgroundColor: 'var(--color-bg-alt)',
                padding: '80px 24px',
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center',
                        fontFamily: 'var(--font-heading)',
                        fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                        fontWeight: 700,
                        marginBottom: '12px',
                    }}>
                        What EnergyGuard Does
                    </h2>
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--color-muted)',
                        marginBottom: '56px',
                        fontSize: '0.95rem',
                    }}>
                        Built on the Building Data Genome Project 2 dataset
                    </p>

                    <div className="row g-4">
                        {[
                            {
                                title: 'Ensemble Detection',
                                desc: 'Three unsupervised models: Isolation Forest, LOF, and Robust Covariance, vote on every data point. Majority wins.',
                            },
                            {
                                title: '8 Energy Streams',
                                desc: 'Electricity, water, gas, steam, hot water, chilled water, irrigation, and solar, all monitored independently.',
                            },
                            {
                                title: 'Anomaly Explanations',
                                desc: 'Every flagged point is explained: spike above baseline, night consumption, weekend deviation, or behavioral shift.',
                            },
                            {
                                title: 'Cost Impact',
                                desc: 'Detected anomalies are translated into estimated energy cost impact, bridging ML output and business decisions.',
                            },
                            {
                                title: 'Smart Caching',
                                desc: 'Analysis results cached in MongoDB. Refresh on demand. Dashboard loads instantly on every subsequent visit.',
                            },
                            {
                                title: 'New Building Support',
                                desc: 'Register any building by uploading your own energy CSVs. The same detection pipeline runs on your data instantly.',
                            },
                        ].map((feature, i) => (
                            <div key={i} className="col-md-4">
                                <div className="card card-hover h-100" style={{ padding: '28px' }}>
                                    <h5 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontWeight: 700,
                                        color: 'var(--color-text)',
                                        marginBottom: '12px',
                                        fontSize: '1.1rem',
                                    }}>
                                        {feature.title}
                                    </h5>
                                    <p style={{
                                        color: 'var(--color-muted)',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.7,
                                        margin: 0,
                                    }}>
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="eg-footer">
                EnergyGuard. Smart Building Anomaly Detection. Built on BDGP2 dataset. For portfolio and research purposes only.
            </footer>

        </div>
    )
}

export default Landing