const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All settings routes require authentication

router.route('/')
    .get(getSettings)
    .put(authorize('Super Admin', 'Admin'), updateSettings);

module.exports = router;
