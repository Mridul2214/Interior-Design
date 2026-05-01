const express = require('express');
const {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    getClientStats
} = require('../controllers/clientController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.route('/')
    .get(getClients)
    .post(createClient);

router.get('/stats', getClientStats);

router.route('/:id')
    .get(getClient)
    .put(updateClient)
    .delete(authorize('Super Admin', 'Admin'), deleteClient);

module.exports = router;
