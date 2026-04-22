const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getManagerDashboard,
    getStaffDashboard,
    getOverdueTasks,
    getStaffPerformance
} = require('../controllers/designDashboardController');

router.use(protect);

router.get('/dashboard/manager', authorize('Super Admin', 'Admin', 'Manager', 'Design Manager'), getManagerDashboard);

router.get('/dashboard/staff', getStaffDashboard);

router.get('/tasks/overdue', getOverdueTasks);

router.get('/staff/performance', authorize('Super Admin', 'Admin', 'Manager', 'Design Manager'), getStaffPerformance);

module.exports = router;
