const Task = require('../models/Task');
const { createNotification, notifyStaffUser } = require('../utils/notificationHelper');

exports.getTasks = async (req, res) => {
    try {
        const { search, status, priority, assignedTo, page = 1, limit = 1000 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        // Automatically filter for staff users
        if (req.user.role === 'Staff') {
            const Staff = require('../models/Staff');
            const staffMember = await Staff.findOne({ email: req.user.email });
            if (staffMember) {
                query.assignedTo = staffMember._id;
            } else {
                // If staff not found, return empty (or error)
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount')
            .populate('team', 'name')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount')
            .populate('team', 'name')
            .populate('createdBy', 'fullName');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        // Validate quotation is approved if provided
        if (req.body.quotation) {
            const Quotation = require('../models/Quotation');
            const quotation = await Quotation.findById(req.body.quotation);

            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: 'Quotation not found'
                });
            }

            if (quotation.status !== 'Approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Only approved quotations can be assigned to tasks. Please wait for client approval.'
                });
            }
        }

        req.body.createdBy = req.user.id;
        const task = await Task.create(req.body);

        // Populate before returning
        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount');

        res.status(201).json({ success: true, data: populatedTask });

        // Send notifications (after response to avoid delay)
        createNotification({
            title: '📌 New Task Created',
            description: `Task "${populatedTask.title}" assigned to ${populatedTask.assignedTo?.name || 'staff'}. Due: ${new Date(populatedTask.dueDate).toLocaleDateString('en-IN')}.`,
            type: 'Task',
            relatedModel: 'Task',
            relatedId: populatedTask._id,
            createdBy: req.user.id
        });

        // Notify the assigned staff member
        if (populatedTask.assignedTo?.email) {
            notifyStaffUser(populatedTask.assignedTo.email, {
                title: '🛠️ New Task Assigned to You',
                description: `You have been assigned "${populatedTask.title}". Priority: ${populatedTask.priority}. Due: ${new Date(populatedTask.dueDate).toLocaleDateString('en-IN')}.`,
                type: 'Task',
                relatedModel: 'Task',
                relatedId: populatedTask._id,
                createdBy: req.user.id
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const oldStatus = task.status;
        const oldAssignedTo = task.assignedTo?.toString();

        // Validate quotation is approved if being updated
        if (req.body.quotation && req.body.quotation !== task.quotation?.toString()) {
            const Quotation = require('../models/Quotation');
            const quotation = await Quotation.findById(req.body.quotation);

            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: 'Quotation not found'
                });
            }

            if (quotation.status !== 'Approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Only approved quotations can be assigned to tasks. Please wait for client approval.'
                });
            }
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount');

        res.status(200).json({ success: true, data: task });

        // Send notifications after response (non-blocking)
        if (req.body.status && req.body.status !== oldStatus) {
            // Notify admins about status change
            createNotification({
                title: `🔄 Task Status: ${req.body.status}`,
                description: `Task "${task.title}" status changed from "${oldStatus}" to "${req.body.status}". Assigned to: ${task.assignedTo?.name || 'Unassigned'}`,
                type: req.body.status === 'Completed' ? 'Success' : 'Task',
                relatedModel: 'Task',
                relatedId: task._id,
                createdBy: req.user.id
            });

            // Notify the staff member about their task status change
            if (task.assignedTo?.email) {
                notifyStaffUser(task.assignedTo.email, {
                    title: `🔄 Your Task Updated`,
                    description: `Task "${task.title}" status changed to "${req.body.status}".`,
                    type: req.body.status === 'Completed' ? 'Success' : 'Task',
                    relatedModel: 'Task',
                    relatedId: task._id,
                    createdBy: req.user.id
                });
            }
        }

        // If task was reassigned, notify the new staff member
        if (req.body.assignedTo && req.body.assignedTo !== oldAssignedTo && task.assignedTo?.email) {
            notifyStaffUser(task.assignedTo.email, {
                title: '🛠️ Task Reassigned to You',
                description: `You have been assigned "${task.title}". Priority: ${task.priority}. Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')}.`,
                type: 'Task',
                relatedModel: 'Task',
                relatedId: task._id,
                createdBy: req.user.id
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        await task.deleteOne();
        res.status(200).json({ success: true, message: 'Task deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTaskStats = async (req, res) => {
    try {
        const total = await Task.countDocuments();
        const todo = await Task.countDocuments({ status: 'To Do' });
        const inProgress = await Task.countDocuments({ status: 'In Progress' });
        const completed = await Task.countDocuments({ status: 'Completed' });
        const blocked = await Task.countDocuments({ status: 'Blocked' });

        const overdue = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
        });

        const urgent = await Task.countDocuments({ priority: 'Critical' });

        res.status(200).json({
            success: true,
            data: { total, todo, inProgress, completed, blocked, overdue, urgent }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
