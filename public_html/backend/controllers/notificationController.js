const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const { isRead, page = 1, limit = 20, type } = req.query;
        let query = { recipient: req.user.id };

        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }
        if (type) {
            query.type = type;
        }

        const skip = (page - 1) * limit;
        const notifications = await Notification.find(query)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            count: notifications.length,
            total,
            unreadCount,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await notification.markAsRead();

        res.status(200).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await notification.deleteOne();

        res.status(200).json({ success: true, message: 'Notification deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createNotification = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        // Handle frontend payload aliases
        if (req.body.message && !req.body.description) {
            req.body.description = req.body.message;
        }
        
        // Handle case-sensitive enum type
        if (req.body.type) {
            req.body.type = req.body.type.charAt(0).toUpperCase() + req.body.type.slice(1).toLowerCase();
        }

        // Handle role-based notifications
        if (req.body.recipientRole && !req.body.recipient) {
            const User = require('../models/User');
            const users = await User.find({ role: req.body.recipientRole, status: 'Active' });
            
            if (users.length > 0) {
                // Create a notification for every active user with that role
                const notifications = await Promise.all(users.map(user => {
                    return Notification.create({
                        ...req.body,
                        recipient: user._id
                    });
                }));
                return res.status(201).json({ success: true, data: notifications[0] });
            } else {
                 return res.status(404).json({ success: false, message: `No active users found with role ${req.body.recipientRole}` });
            }
        }

        const notification = await Notification.create(req.body);
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
