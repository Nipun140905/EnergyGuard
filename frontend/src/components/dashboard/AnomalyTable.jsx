const AnomalyTable = ({ anomalies, streamName }) => {
    return (
        <div className="card" style={{ padding: '24px' }}>
            <h5 style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600, marginBottom: '20px', textTransform: 'capitalize',
            }}>
                {streamName} — Detected Anomalies ({anomalies.length})
            </h5>
            {anomalies.length === 0 ? (
                <p style={{
                    color: 'var(--color-muted)', fontSize: '0.9rem',
                    textAlign: 'center', padding: '32px 0',
                }}>
                    No anomalies detected for this energy stream.
                </p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Timestamp', 'Value', 'Rolling Mean', 'Deviation', 'Votes', 'Explanation'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 12px', textAlign: 'left',
                                        color: 'var(--color-muted)', fontWeight: 500,
                                        fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                                        textTransform: 'uppercase', letterSpacing: '0.06em',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {anomalies.map((anomaly, i) => (
                                <tr key={i}
                                    style={{
                                        borderBottom: '1px solid rgba(89,70,59,0.3)',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(85,31,34,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                                        {anomaly.timestamp}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-text)', fontWeight: 500 }}>
                                        {Number(anomaly.value).toFixed(4)}
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)' }}>
                                        {Number(anomaly.rolling_mean).toFixed(4)}
                                    </td>
                                    <td style={{
                                        padding: '10px 12px',
                                        color: anomaly.deviation > 0 ? '#EF4444' : anomaly.deviation < 0 ? '#0D9488' : 'var(--color-muted)',
                                        fontWeight: 500,
                                    }}>
                                        {anomaly.deviation > 0 ? '+' : ''}{Number(anomaly.deviation).toFixed(4)}
                                    </td>
                                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(85,31,34,0.3)',
                                            color: 'var(--color-text)',
                                            fontSize: '0.8rem', fontWeight: 600,
                                        }}>
                                            {anomaly.votes}/3
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px 12px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                                        {anomaly.explanation}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AnomalyTable