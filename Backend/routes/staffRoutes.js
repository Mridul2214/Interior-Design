const express = require('express');
const {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffAnalytics,
    getAllStaffAnalytics
} = require('../controllers/staffController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.use(protect); // All routes are protected

// Analytics overview must be above /:id to avoid route conflict
router.get('/analytics/overview', getAllStaffAnalytics);

router
    .route('/')
    .get(getAllStaff)
    .post(createStaff);

router
    .route('/:id')
    .get(getStaffById)
    .put(updateStaff)
    .delete(deleteStaff);

router.get('/:id/analytics', getStaffAnalytics);

module.exports = router;
