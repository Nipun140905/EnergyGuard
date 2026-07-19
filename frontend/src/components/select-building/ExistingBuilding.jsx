import { useState } from 'react'

const ExistingBuilding = ({ buildings, onBack, onSubmit, onClearError, loading }) => {
    const [selectedBuilding, setSelectedBuilding] = useState('')
    const [buildingSearch, setBuildingSearch] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)

    const filtered = buildings.filter(b =>
        b.building_id.toLowerCase().includes(buildingSearch.toLowerCase()) ||
        (b.primary_use && b.primary_use.toLowerCase().includes(buildingSearch.toLowerCase()))
    ).slice(0, 50)

    return (
        <div>
            <button
                onClick={onBack}
                style={{
                    background: 'none', border: 'none',
                    color: 'var(--color-muted)', fontSize: '0.85rem',
                    cursor: 'pointer', marginBottom: '24px', padding: 0,
                }}
            >
                ← Back
            </button>

            <div style={{ marginBottom: '28px', position: 'relative' }}>
                <label className="form-label">Search Your Building</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Type building ID or primary use..."
                    value={buildingSearch}
                    onChange={e => {
                        setBuildingSearch(e.target.value)
                        setSelectedBuilding('')
                        onClearError()
                        setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />
                {showDropdown && buildingSearch.length > 0 && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px', maxHeight: '200px',
                        overflowY: 'auto', zIndex: 100, marginTop: '4px',
                    }}>
                        {filtered.map(b => (
                            <div
                                key={b.building_id}
                                onMouseDown={() => {
                                    setSelectedBuilding(b.building_id)
                                    setBuildingSearch(b.building_id)
                                    setShowDropdown(false)
                                }}
                                style={{
                                    padding: '10px 14px', cursor: 'pointer',
                                    fontSize: '0.85rem', color: 'var(--color-text)',
                                    borderBottom: '1px solid rgba(89,70,59,0.2)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(85,31,34,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {b.building_id} {b.primary_use ? `(${b.primary_use})` : ''}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <button
                className="btn btn-primary w-100"
                onClick={() => onSubmit(selectedBuilding)}
                disabled={loading}
                style={{ padding: '12px', fontSize: '1rem' }}
            >
                {loading ? 'Linking building...' : 'Continue'}
            </button>
        </div>
    )
}

export default ExistingBuilding