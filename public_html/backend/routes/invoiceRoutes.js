const express = require('express');
const {
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getInvoiceStats
} = require('../controllers/invoiceController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getInvoices)
    .post(createInvoice);

router.get('/stats', getInvoiceStats);

router.route('/:id')
    .get(getInvoice)
    .put(updateInvoice)
    .delete(authorize('Super Admin', 'Admin'), deleteInvoice);

router.put('/:id/payment', recordPayment);

module.exports = router;
