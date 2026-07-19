import { useState, useEffect } from 'react'
import api from '../utils/api'

const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me')
                setUser(res.data.user)
            } catch {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } finally {
            setUser(null)
        }
    }

    return { user, loading, setUser, logout }
}

export default useAuth