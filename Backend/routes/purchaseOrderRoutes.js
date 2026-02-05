const express = require('express');
const {
    getPurchaseOrders,
    getPurchaseOrder,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseOrder,
    markAsReceived,
    getPOStats
} = require('../controllers/purchaseOrderController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getPurchaseOrders)
    .post(createPurchaseOrder);

router.get('/stats', getPOStats);

router.route('/:id')
    .get(getPurchaseOrder)
    .put(updatePurchaseOrder)
    .delete(authorize('Super Admin', 'Admin'), deletePurchaseOrder);

router.put('/:id/approve', authorize('Super Admin', 'Admin', 'Manager'), approvePurchaseOrder);
router.put('/:id/receive', markAsReceived);

module.exports = router;
