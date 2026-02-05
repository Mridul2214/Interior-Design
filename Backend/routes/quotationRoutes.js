const express = require('express');
const {
    getQuotations,
    getQuotation,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    approveQuotation,
    getQuotationStats
} = require('../controllers/quotationController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getQuotations)
    .post(createQuotation);

router.get('/stats', getQuotationStats);

router.route('/:id')
    .get(getQuotation)
    .put(updateQuotation)
    .delete(authorize('Super Admin', 'Admin'), deleteQuotation);

router.put('/:id/approve', authorize('Super Admin', 'Admin', 'Manager'), approveQuotation);

module.exports = router;
