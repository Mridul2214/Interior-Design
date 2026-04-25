const Notification = require('../models/Notification');
const User = require('../models/User');
const Task = require('../models/Task');

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
            const adminUsers = await User.find({
                role: { $in: ['Super Admin', 'Admin', 'Manager'] },
                status: 'Active'
            }).select('_id');
            recipients = adminUsers.map(u => u._id);
        }

        const notifications = [];
        for (const recipientId of recipients) {
            if (createdBy && recipientId.toString() === createdBy.toString()) {
                continue;
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

const notifyByRole = async (role, options) => {
    try {
        const users = await User.find({
            role: { $regex: new RegExp(role, 'i') },
            status: 'Active'
        }).select('_id');

        const notifications = [];
        for (const user of users) {
            notifications.push({
                title: options.title,
                description: options.description,
                type: options.type || 'Info',
                recipient: user._id,
                relatedModel: options.relatedModel,
                relatedId: options.relatedId,
                createdBy: options.createdBy
            });
        }

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        return notifications;
    } catch (error) {
        console.error('Error notifying by role:', error.message);
        return [];
    }
};

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

const checkTaskDeadlines = async () => {
    try {
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

        const urgentTasks = await Task.find({
            dueDate: { $lte: in24Hours, $gt: now },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        const upcomingTasks = await Task.find({
            dueDate: { $lte: in48Hours, $gt: in24Hours },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        const overdueTasks = await Task.find({
            dueDate: { $lt: now },
            status: { $nin: ['Completed'] }
        }).populate('assignedTo', 'name email');

        for (const task of urgentTasks) {
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /urgent|due soon/i },
                createdAt: { $gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) }
            });

            if (!existingNotif) {
                const hoursLeft = Math.round((task.dueDate - now) / (1000 * 60 * 60));

                await createNotification({
                    title: 'Task Due Soon',
                    description: `"${task.title}" is due in ${hoursLeft} hours. Assigned to: ${task.assignedTo?.name || 'Unassigned'}`,
                    type: 'Warning',
                    relatedModel: 'Task',
                    relatedId: task._id
                });

                if (task.assignedTo?.email) {
                    await notifyStaffUser(task.assignedTo.email, {
                        title: 'Task Due Soon',
                        description: `Your task "${task.title}" is due in ${hoursLeft} hours.`,
                        type: 'Warning',
                        relatedModel: 'Task',
                        relatedId: task._id
                    });
                }
            }
        }

        for (const task of upcomingTasks) {
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /upcoming|approaching/i },
                createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            });

            if (!existingNotif && task.assignedTo?.email) {
                await notifyStaffUser(task.assignedTo.email, {
                    title: 'Task Deadline Approaching',
                    description: `Your task "${task.title}" is due within 2 days.`,
                    type: 'Info',
                    relatedModel: 'Task',
                    relatedId: task._id
                });
            }
        }

        for (const task of overdueTasks) {
            const existingNotif = await Notification.findOne({
                relatedModel: 'Task',
                relatedId: task._id,
                title: { $regex: /overdue/i },
                createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            });

            if (!existingNotif) {
                const daysOverdue = Math.round((now - task.dueDate) / (1000 * 60 * 60 * 24));

                await createNotification({
                    title: 'Task Overdue',
                    description: `"${task.title}" is ${daysOverdue} day(s) overdue!`,
                    type: 'Error',
                    relatedModel: 'Task',
                    relatedId: task._id
                });

                if (task.assignedTo?.email) {
                    await notifyStaffUser(task.assignedTo.email, {
                        title: 'Your Task is Overdue',
                        description: `Your task "${task.title}" is ${daysOverdue} day(s) overdue.`,
                        type: 'Error',
                        relatedModel: 'Task',
                        relatedId: task._id
                    });
                }
            }
        }

        console.log(`Task deadline check complete. Urgent: ${urgentTasks.length}, Upcoming: ${upcomingTasks.length}, Overdue: ${overdueTasks.length}`);
    } catch (error) {
        console.error('Error checking task deadlines:', error.message);
    }
};

const notifyUser = async (userId, options) => {
    try {
        return createNotification({
            ...options,
            specificRecipient: userId
        });
    } catch (error) {
        console.error('Error in notifyUser:', error.message);
        return [];
    }
};

module.exports = {
    createNotification,
    notifyByRole,
    notifyUser,
    notifyStaffUser,
    checkTaskDeadlines
};
