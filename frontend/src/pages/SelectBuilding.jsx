import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import useAuth from '../hooks/useAuth'
import ExistingBuilding from '../components/select-building/ExistingBuilding'
import NewBuilding from '../components/select-building/NewBuilding'

const SelectBuilding = () => {
    const navigate = useNavigate()
    const { user, setUser } = useAuth()
    const [step, setStep] = useState('choose')
    const [buildings, setBuildings] = useState([])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchBuildings = async () => {
            try {
                const res = await api.get('/buildings/bdgp2')
                setBuildings(res.data.buildings || [])
            } catch { setBuildings([]) }
        }
        fetchBuildings()
    }, [])

    const clearError = () => setError('')

    const handleExistingSubmit = async (selectedBuilding) => {
        if (!selectedBuilding) { setError('Please select a building'); return }
        setLoading(true)
        try {
            const res = await api.post('/auth/select-building', { building_id: selectedBuilding })
            setUser(res.data.user)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to link building')
        } finally { setLoading(false) }
    }

    const handleNewSubmit = async (form, files) => {
        if (!form.building_name || !form.location || !form.primary_use || !form.size_sqft) {
            setError('All fields are required'); return
        }
        if (Object.keys(files).length === 0) {
            setError('Please upload at least one energy CSV'); return
        }
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('building_name', form.building_name)
            formData.append('location', form.location)
            formData.append('primary_use', form.primary_use)
            formData.append('size_sqft', form.size_sqft)
            Object.entries(files).forEach(([key, file]) => {
                formData.append(key, file)
            })
            const buildingRes = await api.post('/buildings/register-new', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            const res = await api.post('/auth/select-building', { building_id: buildingRes.data.building_id })
            setUser(res.data.user)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="page-enter" style={{
            minHeight: '100vh', backgroundColor: 'var(--color-bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '40px 24px',
        }}>
            <div style={{ width: '100%', maxWidth: '520px' }}>

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-heading)', fontSize: '2.2rem',
                        fontWeight: 800, marginBottom: '8px',
                    }}>
                        Select Your Building
                    </h1>
                    <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem' }}>
                        Welcome, {user?.displayName}. Link your building to get started.
                    </p>
                </div>

                <div className="card" style={{ padding: '36px' }}>

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

                    {step === 'choose' && (
                        <div>
                            <p style={{
                                color: 'var(--color-muted)', fontSize: '0.9rem',
                                marginBottom: '24px', textAlign: 'center',
                            }}>
                                Are you managing an existing BDGP2 building or registering a new one?
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => setStep('existing')}
                                    style={{ padding: '14px', fontSize: '1rem' }}
                                >
                                    Existing BDGP2 Building
                                </button>
                                <button
                                    className="btn w-100"
                                    onClick={() => setStep('new')}
                                    style={{
                                        padding: '14px', fontSize: '1rem',
                                        border: '1px solid var(--color-border)',
                                        color: 'var(--color-text)', backgroundColor: 'transparent',
                                    }}
                                >
                                    Register New Building
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'existing' && (
                        <ExistingBuilding
                            buildings={buildings}
                            onBack={() => { setStep('choose'); setError('') }}
                            onSubmit={handleExistingSubmit}
                            onClearError={clearError}
                            loading={loading}
                        />
                    )}

                    {step === 'new' && (
                        <NewBuilding
                            onBack={() => { setStep('choose'); setError('') }}
                            onSubmit={handleNewSubmit}
                            onClearError={clearError}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default SelectBuilding