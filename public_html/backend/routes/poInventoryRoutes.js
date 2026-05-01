const express = require('express');
const {
    getPOInventoryItems,
    getPOInventoryItem,
    createPOInventoryItem,
    updatePOInventoryItem,
    deletePOInventoryItem
} = require('../controllers/poInventoryController');

const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getPOInventoryItems)
    .post(createPOInventoryItem);

router.route('/:id')
    .get(getPOInventoryItem)
    .put(updatePOInventoryItem)
    .delete(authorize('Super Admin', 'Admin'), deletePOInventoryItem);

module.exports = router;
