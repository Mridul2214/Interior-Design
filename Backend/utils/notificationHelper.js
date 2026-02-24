const Notification = require('../models/Notification');
const User = require('../models/User');
const Task = require('../models/Task');

/**
 * Create a notification for all admin/manager users
 * @param {Object} options
 * @param {string} options.title - Notification title
 * @param {string} options.description - Notification description
 * @param {string} options.type - Notification type (Info, Success, Warning, Error, Quote, Invoice, Task, Inventory, PO)
 * @param {string} [options.relatedModel] - Related model name
 * @param {ObjectId} [options.relatedId] - Related document ID
 * @param {ObjectId} [options.createdBy] - User who triggered the notification
 * @param {ObjectId} [options.specificRecipient] - If set, only notify this user
 */
const createNotification = async (options) => {
    try {
        const {
            title,
            description,
            type = 'Info',
            relatedModel = null,
            relatedId = null,
            createdBy = null,
            specificRecipient = null
        } = options;

        let recipients = [];

        if (specificRecipient) {
            recipients = [specificRecipient];
        } else {
            // Notify all admins, super admins, and managers
            const adminUsers = await User.find({
                role: { $in: ['Super Admin', 'Admin', 'Manager'] },
                status: 'Active'
            }).select('_id');
            recipients = adminUsers.map(u => u._id);
        }

        // Create notifications for all recipients (skip the creator to avoid self-notifications)
        const notifications = [];
        for (const recipientId of recipients) {
            if (createdBy && recipientId.toString() === createdBy.toString()) {
                continue; // Don't notify the person who created the item
            }
            notifications.push({
                title,
                description,
                type,
                recipient: recipientId,
                relatedModel,
                relatedId,
                createdBy
            });
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return notifications;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        return [];
    }
};

/**
 * Notify staff member about their task
 * @param {ObjectId} staffUserId - The User account ID linked to the staff member
 * @param {Object} options - Same as createNotification options
 */
const notifyStaffUser = async (staffEmail, options) => {
    try {
        const user = await User.findOne({ email: staffEmail, status: 'Active' }).select('_id');
        if (user) {
            return createNotification({
                ...options,
                specificRecipient: user._id
            });
        }
    } catch (error) {
        console.error('Error notifying staff user:', error.message);
    }
    return [];
};

/**
 * Check tasks for upcoming deadlines and overdue tasks, then create notifications
 * This should be called periodically (e.g., every hour or on server start)
 */
const checkTaskDeadlines = async () => {
    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        // Find tasks due within 24 hours that are not completed
        const urgentTasks = await Task.find({
            dueDate: { $lte: in24Hours, $gt: now },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        // Find tasks due within 48 hours (but not within 24h)
        const upcomingTasks = await Task.find({
            dueDate: { $lte: in48Hours, $gt: in24Hours },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        // Find overdue tasks
        const overdueTasks = await Task.find({
            dueDate: { $lt: now },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        // Create notifications for urgent tasks (due within 24 hours)
        for (const task of urgentTasks) {
            // Check if we already sent a notification for this task recently (within last 12 hours)
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /urgent|due soon/i },
                createdAt: { $gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) }
            });

            if (!existingNotif) {
                const hoursLeft = Math.round((task.dueDate - now) / (1000 * 60 * 60));

                // Notify admins
                await createNotification({
                    title: '⚠️ Task Due Soon',
                    description: `"${task.title}" is due in ${hoursLeft} hours. Assigned to: ${task.assignedTo?.name || 'Unassigned'}`,
                    type: 'Warning',
                    relatedModel: 'Task',
                    relatedId: task._id
                });

                // Also notify the assigned staff member
                if (task.assignedTo?.email) {
                    await notifyStaffUser(task.assignedTo.email, {
                        title: '⏰ Task Due Soon',
                        description: `Your task "${task.title}" is due in ${hoursLeft} hours. Please complete it on time.`,
                        type: 'Warning',
                        relatedModel: 'Task',
                        relatedId: task._id
                    });
                }
            }
        }

        // Create notifications for upcoming tasks (due within 48 hours)
        for (const task of upcomingTasks) {
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /upcoming|approaching/i },
                createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            });

            if (!existingNotif) {
                // Notify the assigned staff member
                if (task.assignedTo?.email) {
                    await notifyStaffUser(task.assignedTo.email, {
                        title: '📋 Task Deadline Approaching',
                        description: `Your task "${task.title}" is due within 2 days. Make sure you're on track.`,
                        type: 'Info',
                        relatedModel: 'Task',
                        relatedId: task._id
                    });
                }
            }
        }

        // Create notifications for overdue tasks
        for (const task of overdueTasks) {
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /overdue/i },
                createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            });

            if (!existingNotif) {
                const daysOverdue = Math.round((now - task.dueDate) / (1000 * 60 * 60 * 24));

                // Notify admins
                await createNotification({
                    title: '🚨 Task Overdue',
                    description: `"${task.title}" is ${daysOverdue} day(s) overdue! Assigned to: ${task.assignedTo?.name || 'Unassigned'}`,
                    type: 'Error',
                    relatedModel: 'Task',
                    relatedId: task._id
                });

                // Notify the staff member
                if (task.assignedTo?.email) {
                    await notifyStaffUser(task.assignedTo.email, {
                        title: '🚨 Your Task is Overdue',
                        description: `Your task "${task.title}" is ${daysOverdue} day(s) overdue. Please update the status or complete it immediately.`,
                        type: 'Error',
                        relatedModel: 'Task',
                        relatedId: task._id
                    });
                }
            }
        }

        console.log(`📬 Task deadline check complete. Urgent: ${urgentTasks.length}, Upcoming: ${upcomingTasks.length}, Overdue: ${overdueTasks.length}`);
    } catch (error) {
        console.error('Error checking task deadlines:', error.message);
    }
};

module.exports = {
    createNotification,
    notifyStaffUser,
    checkTaskDeadlines
};
