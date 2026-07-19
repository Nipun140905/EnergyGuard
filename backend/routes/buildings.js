const express = require('express');
const router = express.Router();
const {
    getMyBuilding,
    analyse,
    register,
    getBDGP2Buildings,
} = require('../controllers/buildingController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

router.get('/my', protect, getMyBuilding);
router.post('/analyse', protect, analyse);
router.post(
    '/register-new',
    protect,
    upload.fields([
        { name: 'electricity_csv', maxCount: 1 },
        { name: 'water_csv', maxCount: 1 },
        { name: 'gas_csv', maxCount: 1 },
        { name: 'steam_csv', maxCount: 1 },
        { name: 'hotwater_csv', maxCount: 1 },
        { name: 'chilledwater_csv', maxCount: 1 },
        { name: 'irrigation_csv', maxCount: 1 },
        { name: 'solar_csv', maxCount: 1 },
    ]),
    register
);
router.get('/bdgp2', getBDGP2Buildings);

module.exports = router;