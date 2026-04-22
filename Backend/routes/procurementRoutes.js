const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getMaterialRequests, createMaterialRequest, updateMaterialRequest, createVendorComparison, getVendorComparisons, selectVendor, createPOFromComparison, getProcurementStats } = require('../controllers/procurementController');

router.use(protect);

router.route('/material-requests')
    .get(getMaterialRequests)
    .post(createMaterialRequest);

router.route('/material-requests/:id')
    .put(updateMaterialRequest);

router.route('/vendor-comparisons')
    .get(getVendorComparisons)
    .post(createVendorComparison);

router.route('/vendor-comparisons/:id/select-vendor')
    .put(selectVendor);

router.route('/vendor-comparisons/:id/create-po')
    .post(createPOFromComparison);

router.route('/stats')
    .get(getProcurementStats);

module.exports = router;
