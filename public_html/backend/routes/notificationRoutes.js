const express = require('express');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
} = require('../controllers/notificationController');

const router = express.Router();
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
    .get(getNotifications)
    .post(createNotification);

router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.route('/:id')
    .delete(deleteNotification);

router.put('/:id/read', markAsRead);

module.exports = router;
