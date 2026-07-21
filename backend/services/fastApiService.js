const fetch = require('node-fetch')

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'

const makeRequest = async (path, options = {}) => {
    const response = await fetch(`${FASTAPI_URL}${path}`, options)
    let data
    try {
        data = await response.json()
    } catch {
        throw new Error('Invalid JSON from FastAPI')
    }
    if (!response.ok) {
        throw new Error(data.detail || 'FastAPI error')
    }
    return data
}

const analyseBuilding = async (building_id) => {
    return makeRequest('/api/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ building_id }),
    })
}

const getBDGP2Buildings = async () => {
    return makeRequest('/api/buildings', { method: 'GET' })
}

const registerBuilding = async (formData) => {
    const response = await fetch(`${FASTAPI_URL}/api/register-building`, {
        method: 'POST',
        body: formData,
    })
    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'FastAPI registration failed')
    }
    return response.json()
}

module.exports = { analyseBuilding, registerBuilding, getBDGP2Buildings }