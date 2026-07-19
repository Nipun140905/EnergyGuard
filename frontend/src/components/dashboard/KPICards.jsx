const KPICards = ({ kpi }) => {
    const cards = [
        { label: 'Total Anomalies', value: kpi.total_anomalies, suffix: '', tooltip: '' },
        { label: 'Anomaly Rate', value: kpi.anomaly_rate, suffix: '%', tooltip: '' },
        {
            label: 'Est. Cost Impact',
            value: `$${kpi.estimated_cost_impact.toLocaleString()}`,
            suffix: '',
            tooltip: kpi.total_anomalies > 0
                ? `cost = (anomaly_value − normal_baseline_mean) × $${kpi.cost_per_unit}/unit\ncost = (anomaly_value − ${kpi.normal_mean}) × $${kpi.cost_per_unit}/unit`
                : '',
        },
        { label: 'Total Records', value: kpi.total_records.toLocaleString(), suffix: '', tooltip: '' },
    ]

    return (
        <div className="row g-3 mb-4">
            {cards.map((card, i) => (
                <div key={i} className="col-6 col-md-3">
                    <div className="card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <p style={{
                                color: 'var(--color-muted)', fontSize: '0.75rem',
                                fontWeight: 500, textTransform: 'uppercase',
                                letterSpacing: '0.08em', margin: 0,
                            }}>
                                {card.label}
                            </p>
                            {card.tooltip && (
                                <span
                                    title={card.tooltip}
                                    style={{ cursor: 'help', color: 'var(--color-muted)', fontSize: '0.8rem', userSelect: 'none' }}
                                >
                                    ⓘ
                                </span>
                            )}
                        </div>
                        <p style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.6rem', fontWeight: 700,
                            color: 'var(--color-text)', margin: 0,
                        }}>
                            {card.value}{card.suffix}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default KPICards