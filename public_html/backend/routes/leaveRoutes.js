const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authorize } = require('../middleware/auth');

router.post('/', authorize('Site Engineer', 'Site Supervisor', 'Project Engineer', 'Project Manager', 'Procurement Manager', 'Store Manager', 'Admin'), leaveController.submitLeave);
router.get('/my-leaves', authorize('Site Engineer', 'Site Supervisor', 'Project Engineer', 'Project Manager', 'Procurement Manager', 'Store Manager', 'Admin'), leaveController.getMyLeaves);
router.get('/pending', authorize('Project Engineer', 'Project Manager', 'Admin'), leaveController.getPendingLeavesForManager);
router.put('/:id/status', authorize('Project Engineer', 'Project Manager', 'Admin'), leaveController.updateLeaveStatus);

module.exports = router;
