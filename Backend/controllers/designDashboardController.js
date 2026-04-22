const Project = require('../models/Project');
const Task = require('../models/Task');
const Quotation = require('../models/Quotation');
const MaterialRequest = require('../models/MaterialRequest');
const Staff = require('../models/Staff');
const User = require('../models/User');

exports.getManagerDashboard = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const designProjects = await Project.find({ stage: 'Design' });
        const designProjectIds = designProjects.map(p => p._id);

        const totalProjects = await Project.countDocuments({ stage: 'Design' });
        const inDesign = await Project.countDocuments({ stage: 'Design', designStatus: 'In Design' });
        const underReview = await Project.countDocuments({ stage: 'Design', designStatus: 'Under Review' });
        const completed = await Project.countDocuments({ stage: 'Procurement', designComplete: true });

        const pendingTasks = await Task.countDocuments({
            project: { $in: designProjectIds },
            status: { $nin: ['Completed'] }
        });

        const overdueTasks = await Task.countDocuments({
            project: { $in: designProjectIds },
            dueDate: { $lt: now },
            status: { $nin: ['Completed'] }
        });

        const pendingBOQ = await Quotation.countDocuments({
            status: { $in: ['Under Review', 'Revision'] }
        });

        const pendingMaterials = await MaterialRequest.countDocuments({
            project: { $in: designProjectIds },
            status: 'Pending'
        });

        const staffPerformance = await Task.aggregate([
            { $match: { project: { $in: designProjectIds } } },
            {
                $group: {
                    _id: '$assignedTo',
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    overdueTasks: {
                        $sum: {
                            $cond: [
                                { $and: [{ $lt: ['$dueDate', now] }, { $ne: ['$status', 'Completed'] }] },
                                1, 0
                            ]
                        }
                    }
                }
            },
            { $lookup: { from: 'staffs', localField: '_id', foreignField: '_id', as: 'staff' } },
            { $unwind: { path: '$staff', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    staffId: '$_id',
                    name: { $ifNull: ['$staff.name', 'Unknown'] },
                    role: { $ifNull: ['$staff.role', 'Unknown'] },
                    totalTasks: 1,
                    completedTasks: 1,
                    overdueTasks: 1,
                    completionRate: {
                        $cond: [
                            { $gt: ['$totalTasks', 0] },
                            { $round: [{ $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 0] },
                            0
                        ]
                    }
                }
            },
            { $sort: { completionRate: -1 } },
            { $limit: 10 }
        ]);

        const monthlyCompletion = await Task.aggregate([
            {
                $match: {
                    project: { $in: designProjectIds },
                    status: 'Completed',
                    completedAt: { $gte: startOfLastMonth }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: '$completedAt' },
                        year: { $year: '$completedAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 6 }
        ]);

        const projectsByStatus = await Project.aggregate([
            { $match: { stage: 'Design' } },
            {
                $group: {
                    _id: { $ifNull: ['$designStatus', 'Not Started'] },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalProjects,
                inDesign,
                underReview,
                completed,
                pendingBOQ,
                overdueTasks,
                pendingMaterials,
                pendingTasks,
                staffPerformance,
                monthlyCompletion: monthlyCompletion.map(m => ({
                    month: m._id.month,
                    year: m._id.year,
                    count: m.count
                })),
                projectsByStatus: projectsByStatus.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaffDashboard = async (req, res) => {
    try {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);

        let staffId = req.user._id;

        const staffMember = await Staff.findOne({ email: req.user.email });
        if (staffMember) {
            staffId = staffMember._id;
        }

        const allTasks = await Task.find({ assignedTo: staffId });

        const myTasks = allTasks.length;
        const pending = allTasks.filter(t => t.status === 'To Do').length;
        const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
        const completed = allTasks.filter(t => t.status === 'Completed').length;
        const blocked = allTasks.filter(t => t.status === 'Blocked').length;

        const overdue = allTasks.filter(t =>
            t.dueDate < now && t.status !== 'Completed'
        ).length;

        const dueToday = allTasks.filter(t => {
            const dueDate = new Date(t.dueDate);
            return dueDate >= todayStart && dueDate < todayEnd && t.status !== 'Completed';
        }).length;

        const recentNotifications = await require('../models/Notification').find({
            recipient: req.user._id,
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('createdBy', 'fullName');

        const unreadCount = await require('../models/Notification').countDocuments({
            recipient: req.user._id,
            isRead: false
        });

        const upcomingTasks = await Task.find({
            assignedTo: staffId,
            status: { $nin: ['Completed'] },
            dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
        })
            .sort({ dueDate: 1 })
            .limit(5)
            .populate('project', 'name');

        const taskStats = {
            total: myTasks,
            pending,
            inProgress,
            completed,
            blocked,
            overdue,
            dueToday
        };

        res.status(200).json({
            success: true,
            data: {
                myTasks: taskStats,
                pending,
                inProgress,
                completed,
                overdue,
                dueToday,
                recentNotifications,
                unreadCount,
                upcomingTasks
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getOverdueTasks = async (req, res) => {
    try {
        const now = new Date();

        const overdueTasks = await Task.find({
            dueDate: { $lt: now },
            status: { $nin: ['Completed'] }
        })
            .populate('assignedTo', 'name email role')
            .populate('project', 'name')
            .sort({ dueDate: 1 });

        const updatedTasks = [];
        for (const task of overdueTasks) {
            if (!task.isOverdue) {
                task.isOverdue = true;
                await task.save();
            }
            updatedTasks.push(task);
        }

        res.status(200).json({
            success: true,
            count: updatedTasks.length,
            data: updatedTasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStaffPerformance = async (req, res) => {
    try {
        const { period = '30' } = req.query;
        const daysAgo = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        const designStaff = await Staff.find({
            role: { $regex: /design/i, $options: 'i' },
            status: 'Active'
        });

        const performanceData = [];

        for (const staff of designStaff) {
            const tasks = await Task.find({
                assignedTo: staff._id,
                createdAt: { $gte: startDate }
            });

            const completedInPeriod = tasks.filter(t =>
                t.status === 'Completed' &&
                t.completedAt &&
                t.completedAt >= startDate
            ).length;

            const overdueCount = tasks.filter(t =>
                t.dueDate < now && t.status !== 'Completed'
            ).length;

            performanceData.push({
                staffId: staff._id,
                name: staff.name,
                role: staff.role,
                totalTasks: tasks.length,
                completedTasks: completedInPeriod,
                overdueTasks: overdueCount,
                onTimeCompletionRate: completedInPeriod > 0
                    ? Math.round((tasks.filter(t => t.isOnTime === true).length / completedInPeriod) * 100)
                    : 0
            });
        }

        performanceData.sort((a, b) => b.completedTasks - a.completedTasks);

        res.status(200).json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
