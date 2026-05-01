const express = require('express');
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats,
    addComment,
    getTaskComments,
    getTaskTimeline,
    reassignTask,
    submitTask,
    reviewSubmission,
    pushToProcurement,
    addDailyUpdate,
    salesApproveTask,
    managerSendToAdmin,
    adminReviewDesign
} = require('../controllers/taskController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTask);

router.get('/stats', getTaskStats);
router.get('/overdue', getTasks);

router.route('/:id')
    .get(getTask)
    .put(updateTask)
    .delete(deleteTask);

router.route('/:id/comments')
    .post(addComment)
    .get(getTaskComments);

router.get('/:id/timeline', getTaskTimeline);

router.put('/:id/reassign', reassignTask);
router.put('/:id/submit', submitTask);
router.put('/:id/review', reviewSubmission);
router.put('/:id/push-procurement', pushToProcurement);
router.post('/:id/daily-update', addDailyUpdate);

// New Design Approval Workflow Routes
router.put('/:id/sales-approve', salesApproveTask);
router.put('/:id/send-to-admin', managerSendToAdmin);
router.put('/:id/admin-review', adminReviewDesign);

module.exports = router;
