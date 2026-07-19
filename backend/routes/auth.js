const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    googleCallback,
    selectBuilding,
    logout,
    getMe,
    deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// GET /auth/google — redirect to Google consent screen
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GET /auth/google/callback — Google redirects here after auth
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    googleCallback
);

// POST /auth/select-building — link building to user after OAuth
router.post('/select-building', protect, selectBuilding);

// POST /auth/logout
router.post('/logout', logout);

// GET /auth/me
router.get('/me', protect, getMe);

// DELETE /auth/delete-account
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;