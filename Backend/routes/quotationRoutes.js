const express = require('express');
const {
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    approveQuotation,
    getQuotationStats,
    getVersionHistory,
    compareVersions,
    calculateTotals
} = require('../controllers/quotationController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getQuotations)
    .post(createQuotation);

router.get('/stats', getQuotationStats);
router.post('/calculate-totals', calculateTotals);

router.route('/:id')
    .get(getQuotation)
    .put(updateQuotation)
    .delete(authorize('Super Admin', 'Admin'), deleteQuotation);

router.put('/:id/approve', authorize('Super Admin', 'Admin', 'Manager', 'Design Manager', 'Procurement Manager', 'Production Manager', 'Accounts Manager'), approveQuotation);
router.get('/:id/versions', getVersionHistory);
router.get('/:id/compare', compareVersions);

module.exports = router;
