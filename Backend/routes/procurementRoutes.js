const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { 
    getMaterialRequests, 
    createMaterialRequest, 
    updateMaterialRequest, 
    createVendorComparison, 
    getVendorComparisons, 
    selectVendor, 
    createPOFromComparison, 
    getProcurementStats,
    assignStaffToRequest,
    getStaffTasks,
    requestTimeExtension,
    respondTimeExtension,
    createVendorPurchase,
    getVendorPurchaseHistory,
    compareVendorPrices,
    getProcurementStaff,
    updatePurchaseStatus,
    approveMaterialRequest
} = require('../controllers/procurementController');

router.use(protect);

router.route('/material-requests')
    .get(getMaterialRequests)
    .post(createMaterialRequest);

router.route('/material-requests/:id/approve-release')
    .put(authorize('Design Manager'), approveMaterialRequest);

router.route('/material-requests/:id')
    .put(updateMaterialRequest);

router.route('/material-requests/:id/assign')
    .put(assignStaffToRequest);

router.route('/material-requests/:id/time-extension')
    .post(requestTimeExtension)
    .put(respondTimeExtension);

router.route('/vendor-comparisons')
    .get(getVendorComparisons)
    .post(createVendorComparison);

router.route('/vendor-comparisons/:id/select-vendor')
    .put(selectVendor);

router.route('/vendor-comparisons/:id/create-po')
    .post(createPOFromComparison);

router.route('/stats')
    .get(getProcurementStats);

router.route('/staff-tasks')
    .get(getStaffTasks);

router.route('/staff')
    .get(getProcurementStaff);

router.route('/vendor-purchases')
    .post(createVendorPurchase)
    .get(getVendorPurchaseHistory);

router.route('/vendor-purchases/compare')
    .post(compareVendorPrices);

router.route('/vendor-purchases/:id')
    .put(updatePurchaseStatus);

module.exports = router;
