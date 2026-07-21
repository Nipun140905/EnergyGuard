const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AnalysisCache = require('../models/AnalysisCache');
const Building = require('../models/Building');

// Set JWT cookie
const setTokenCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

// GET /auth/google/callback — called by passport after Google auth
const googleCallback = async (req, res) => {
    try {
        const user = req.user;
        setTokenCookie(res, user._id);

        // If building not set yet, redirect to building selection
        if (!user.building_id || user.building_id === 'pending') {
            return res.redirect(`${process.env.FRONTEND_URL}/select-building`);
        }

        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
        res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
};

// POST /auth/select-building — called after Google auth to link building
const selectBuilding = async (req, res) => {
    try {
        const { building_id } = req.body;

        if (!building_id) {
            return res.status(400).json({ message: 'Building ID is required' });
        }

        const user = await User.findById(req.user._id);
        user.building_id = building_id;
        await user.save();

        res.status(200).json({
            message: 'Building linked successfully',
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                building_id: user.building_id,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST /auth/logout
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
};

// GET /auth/me
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
                building_id: user.building_id,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE /auth/delete-account
const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;
        const buildingId = req.user.building_id;

        await AnalysisCache.deleteMany({ building_id: buildingId });
        await Building.deleteMany({ owner_user_id: userId });
        await User.findByIdAndDelete(userId);

        res.clearCookie('token');
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    googleCallback,
    selectBuilding,
    logout,
    getMe,
    deleteAccount,
};