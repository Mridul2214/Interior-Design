const express = require('express');
const {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getInventoryStats
} = require('../controllers/inventoryController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getInventoryItems)
    .post(createInventoryItem);

router.get('/stats', getInventoryStats);

router.route('/:id')
    .get(getInventoryItem)
    .put(updateInventoryItem)
    .delete(authorize('Super Admin', 'Admin'), deleteInventoryItem);

module.exports = router;
