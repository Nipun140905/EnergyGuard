const http = require('http')

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'
const FASTAPI_HOST = 'localhost'
const FASTAPI_PORT = 8000

const makeRequest = (options, body = null) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = ''
            res.on('data', (chunk) => { data += chunk })
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data)
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.detail || 'FastAPI error'))
                    } else {
                        resolve(parsed)
                    }
                } catch {
                    reject(new Error('Invalid JSON from FastAPI'))
                }
            })
        })
        req.on('error', reject)
        if (body) req.write(body)
        req.end()
    })
}

const analyseBuilding = async (building_id) => {
    const body = JSON.stringify({ building_id })
    return makeRequest({
        hostname: FASTAPI_HOST,
        port: FASTAPI_PORT,
        path: '/api/analyse',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
        },
    }, body)
}

const getBDGP2Buildings = async () => {
    return makeRequest({
        hostname: FASTAPI_HOST,
        port: FASTAPI_PORT,
        path: '/api/buildings',
        method: 'GET',
    })
}

const registerBuilding = async (formData) => {
    const fetch = require('node-fetch')
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