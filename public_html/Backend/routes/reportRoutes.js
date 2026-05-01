const express = require('express');
const {
    getDashboardStats,
    getRevenueReport,
    getQuotationReport,
    getInventoryReport
} = require('../controllers/reportController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/revenue', getRevenueReport);
router.get('/quotations', getQuotationReport);
router.get('/inventory', getInventoryReport);

module.exports = router;
