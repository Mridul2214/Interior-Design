const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getVendors, getVendor, createVendor, updateVendor, deleteVendor, getVendorStats } = require('../controllers/vendorController');

router.use(protect);

router.route('/')
    .get(getVendors)
    .post(createVendor);

router.route('/stats')
    .get(getVendorStats);

router.route('/:id')
    .get(getVendor)
    .put(updateVendor)
    .delete(deleteVendor);

module.exports = router;
