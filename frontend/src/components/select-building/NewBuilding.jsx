import { useState } from 'react'

const STREAM_LABELS = [
    { key: 'electricity_csv', label: 'Electricity' },
    { key: 'water_csv', label: 'Water' },
    { key: 'gas_csv', label: 'Gas' },
    { key: 'steam_csv', label: 'Steam' },
    { key: 'hotwater_csv', label: 'Hot Water' },
    { key: 'chilledwater_csv', label: 'Chilled Water' },
    { key: 'irrigation_csv', label: 'Irrigation' },
    { key: 'solar_csv', label: 'Solar' },
]

const PRIMARY_USE_OPTIONS = [
    'Lodging/residential', 'Education', 'Office',
    'Entertainment/public assembly', 'Retail', 'Parking',
    'Public services', 'Warehouse/storage', 'Food sales and service',
    'Religious Worship', 'Healthcare', 'Utility',
    'Technology/science', 'Manufacturing/industrial', 'Services', 'Other',
]

const NewBuilding = ({ onBack, onSubmit, onClearError, loading }) => {
    const [form, setForm] = useState({
        building_name: '', location: '', primary_use: '', size_sqft: '',
    })
    const [files, setFiles] = useState({})
    const [showUseDropdown, setShowUseDropdown] = useState(false)

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
        onClearError()
    }
    const handleFile = e => setFiles({ ...files, [e.target.name]: e.target.files[0] })

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

            <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Building Name</label>
                <input
                    type="text"
                    name="building_name"
                    className="form-control"
                    placeholder="e.g. Sunrise Office Complex"
                    value={form.building_name}
                    onChange={handleChange}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Location</label>
                <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Mumbai, India"
                    value={form.location}
                    onChange={handleChange}
                />
            </div>

            <div style={{ marginBottom: '20px', position: 'relative' }}>
                <label className="form-label">Primary Use</label>
                <div
                    className="form-control"
                    onClick={() => setShowUseDropdown(!showUseDropdown)}
                    style={{
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        color: form.primary_use ? 'var(--color-text)' : 'var(--color-muted)'
                    }}
                >
                    {form.primary_use || '— Select primary use —'}
                    <span style={{ fontSize: '0.8rem' }}>▼</span>
                </div>
                {showUseDropdown && (
                    <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        backgroundColor: 'var(--color-bg-primary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px', maxHeight: '200px',
                        overflowY: 'auto', zIndex: 100, marginTop: '4px',
                    }}>
                        {PRIMARY_USE_OPTIONS.map(use => (
                            <div
                                key={use}
                                onClick={() => {
                                    setForm({ ...form, primary_use: use })
                                    setShowUseDropdown(false)
                                    onClearError()
                                }}
                                style={{
                                    padding: '10px 14px', cursor: 'pointer',
                                    fontSize: '0.85rem', color: 'var(--color-text)',
                                    borderBottom: '1px solid rgba(89,70,59,0.2)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(85,31,34,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                {use}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Size (sq ft)</label>
                <input
                    type="number"
                    name="size_sqft"
                    className="form-control"
                    placeholder="e.g. 50000"
                    value={form.size_sqft}
                    onChange={handleChange}
                />
            </div>

            <div style={{ marginBottom: '28px' }}>
                <label className="form-label" style={{ marginBottom: '12px', display: 'block' }}>
                    Upload Energy CSVs (at least one required)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {STREAM_LABELS.map(({ key, label }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                                color: 'var(--color-muted)', fontSize: '0.85rem',
                                width: '110px', flexShrink: 0,
                            }}>
                                {label}
                            </span>
                            <input
                                type="file"
                                name={key}
                                accept=".csv"
                                onChange={handleFile}
                                style={{ color: 'var(--color-text)', fontSize: '0.8rem', flex: 1 }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <button
                className="btn btn-primary w-100"
                onClick={() => onSubmit(form, files)}
                disabled={loading}
                style={{ padding: '12px', fontSize: '1rem' }}
            >
                {loading ? 'Registering...' : 'Register Building'}
            </button>
        </div>
    )
}

export default NewBuilding