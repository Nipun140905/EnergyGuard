const STREAM_COLORS = {
    electricity: '#2563EB',
    water: '#0D9488',
    chilledwater: '#7C3AED',
    irrigation: '#D97706',
    gas: '#F59E0B',
    steam: '#EF4444',
    hotwater: '#F97316',
    solar: '#EAB308',
}

const StreamTabs = ({ streams, activeStream, onStreamChange }) => {
    return (
        <div style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap',
            marginBottom: '32px', borderBottom: '1px solid var(--color-border)',
        }}>
            {Object.keys(streams).map(stream => (
                <button
                    key={stream}
                    onClick={() => onStreamChange(stream)}
                    style={{
                        padding: '10px 20px', fontSize: '0.85rem',
                        fontWeight: 500, fontFamily: 'var(--font-body)',
                        border: 'none',
                        borderBottom: activeStream === stream
                            ? `2px solid ${STREAM_COLORS[stream]}`
                            : '2px solid transparent',
                        backgroundColor: 'transparent',
                        color: activeStream === stream
                            ? STREAM_COLORS[stream] : 'var(--color-muted)',
                        cursor: 'pointer', textTransform: 'capitalize',
                        transition: 'color 0.2s ease',
                    }}
                >
                    {stream}
                </button>
            ))}
        </div>
    )
}

export { STREAM_COLORS }
export default StreamTabs