const Building = require('../models/Building');
const AnalysisCache = require('../models/AnalysisCache');
const { analyseBuilding, registerBuilding } = require('../services/fastApiService');

// GET /buildings/my
const getMyBuilding = async (req, res) => {
    try {
        const building_id = req.user.building_id;
        const cache = await AnalysisCache.find({ building_id });
        res.status(200).json({
            building_id,
            cache: cache.map((entry) => ({
                stream: entry.stream,
                results: entry.results,
                computed_at: entry.computed_at,
                is_stale: entry.is_stale,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /buildings/analyse
const analyse = async (req, res) => {
    try {
        const building_id = req.user.building_id;
        const fastApiResult = await analyseBuilding(building_id);
        for (const [stream, streamData] of Object.entries(fastApiResult.streams)) {
            await AnalysisCache.findOneAndUpdate(
                { building_id, stream },
                {
                    building_id,
                    stream,
                    results: streamData,
                    computed_at: new Date(),
                    is_stale: false,
                },
                { upsert: true, new: true }
            );
        }
        res.status(200).json(fastApiResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /buildings/register-new
const register = async (req, res) => {
    try {
        const { building_name, location, primary_use, size_sqft } = req.body;

        if (!building_name || !location || !primary_use || !size_sqft) {
            return res.status(400).json({ message: 'All building fields are required' });
        }

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: 'At least one energy CSV must be uploaded' });
        }

        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('building_name', building_name);
        formData.append('location', location);
        formData.append('primary_use', primary_use);
        formData.append('size_sqft', size_sqft);

        for (const [fieldname, fileArray] of Object.entries(req.files)) {
            const file = fileArray[0];
            formData.append(fieldname, file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });
        }

        const fastApiResult = await registerBuilding(formData);
        const building_id = fastApiResult.building_id;

        await Building.create({
            building_id,
            name: building_name,
            location,
            primary_use,
            size_sqft: parseFloat(size_sqft),
            owner_user_id: req.user._id,
        });

        req.user.building_id = building_id;
        await req.user.save();

        for (const [stream, streamData] of Object.entries(fastApiResult.streams)) {
            await AnalysisCache.findOneAndUpdate(
                { building_id, stream },
                {
                    building_id,
                    stream,
                    results: streamData,
                    computed_at: new Date(),
                    is_stale: false,
                },
                { upsert: true, new: true }
            );
        }

        res.status(201).json(fastApiResult);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBDGP2Buildings = async (req, res) => {
    try {
        const fastApiService = require('../services/fastApiService');
        const data = await fastApiService.getBDGP2Buildings();
        res.status(200).json(data);
    } catch (error) {
        console.error('getBDGP2Buildings error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMyBuilding, analyse, register, getBDGP2Buildings };