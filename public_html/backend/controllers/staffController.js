const Staff = require('../models/Staff');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private
exports.getAllStaff = async (req, res, next) => {
    try {
        const staff = await Staff.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private
exports.getStaffById = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }
        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private
exports.createStaff = async (req, res, next) => {
    try {
        const { name, email, phone, role, joiningDate, status, password } = req.body;

        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
        }
        if (!phone || !/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ success: false, message: 'Phone number must be exactly 10 digits' });
        }
        if (!role || role.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Role is required (at least 2 characters)' });
        }
        if (email && !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        // Check if user already exists
        if (email) {
            const User = require('../models/User');
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'A user with this email already exists' });
            }
        }

        // 1. Create the Staff record
        const staff = await Staff.create({
            name,
            email,
            phone,
            role,
            joiningDate,
            status,
            createdBy: req.user.id
        });

        // 2. Create User record
        if (email && password) {
            const User = require('../models/User');
            let dept = 'Admin';
            if (role.toLowerCase().includes('design')) dept = 'Design';
            else if (role.toLowerCase().includes('procurement')) dept = 'Procurement';
            else if (role.toLowerCase().includes('production')) dept = 'Production';
            else if (role.toLowerCase().includes('accounts')) dept = 'Accounts';

            await User.create({
                fullName: name,
                email,
                phone,
                role: role,
                password,
                department: dept,
                staffId: staff.staffId,
                status: 'Active'
            });
        }

        res.status(201).json({ success: true, data: staff });
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ success: false, message: `A staff member with this ${field} already exists` });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private
exports.updateStaff = async (req, res, next) => {
    try {
        let staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff not found' });
        }

        staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        // Sync updates to the associated User login account
        const User = require('../models/User');
        let user = null;
        if (staff.staffId) {
            user = await User.findOne({ staffId: staff.staffId });
        }
        if (!user && staff.email) {
            user = await User.findOne({ email: staff.email.toLowerCase() });
        }

        if (user) {
            user.fullName = staff.name;
            user.email = staff.email;
            user.phone = staff.phone;
            user.role = staff.role;
            user.status = staff.status === 'Inactive' ? 'Inactive' : 'Active';

            if (req.body.password) {
                user.password = req.body.password;
            }

            await user.save();
        }

        res.status(200).json({ success: true, data: staff });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Update failed: Email or Phone already in use' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private
exports.deleteStaff = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Also delete the associated User login account if one exists
        if (staff.staffId) {
            const User = require('../models/User');
            await User.findOneAndDelete({ staffId: staff.staffId });
        }

        await Staff.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get staff analytics for a single staff member
// @route   GET /api/staff/:id/analytics
// @access  Private
exports.getStaffAnalytics = async (req, res, next) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        // Get all tasks assigned to this staff member
        const allTasks = await Task.find({ assignedTo: req.params.id })
            .populate('client', 'name')
            .populate('quotation', 'projectName quotationNumber');

        const completedTasks = allTasks.filter(t => t.status === 'Completed');
        const onTimeTasks = completedTasks.filter(t => t.isOnTime === true);
        const pendingTasks = allTasks.filter(t => t.status !== 'Completed');

        // Get current assignment (most recent incomplete task)
        const currentTask = await Task.findOne({
            assignedTo: req.params.id,
            status: { $ne: 'Completed' }
        })
            .populate('client', 'name')
            .populate('quotation', 'projectName')
            .sort({ createdAt: -1 });

        const totalTasks = allTasks.length;
        const completedCount = completedTasks.length;
        const onTimeCount = onTimeTasks.length;

        const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
        const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0;

        // Determine efficiency trend
        let efficiencyTrend = 'new';
        if (totalTasks > 0) {
            if (onTimeRate >= 85) efficiencyTrend = 'improving';
            else if (onTimeRate >= 60) efficiencyTrend = 'stable';
            else efficiencyTrend = 'needs improvement';
        }

        const analytics = {
            staffName: staff.name,
            role: staff.role,
            currentClient: currentTask?.client?.name || 'No active assignment',
            currentProject: currentTask?.quotation?.projectName || 'No active project',
            performanceScore: completionRate,
            tasksCompleted: completedCount,
            totalTasksAssigned: totalTasks,
            onTimeCompletionRate: onTimeRate,
            efficiencyTrend,
            pendingTasks: pendingTasks.length,
            activeTasks: allTasks.filter(t => t.status === 'In Progress').length
        };

        res.status(200).json({
            success: true,
            data: analytics
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get all staff analytics overview
// @route   GET /api/staff/analytics/overview
// @access  Private
exports.getAllStaffAnalytics = async (req, res, next) => {
    try {
        const allStaff = await Staff.find();

        const analytics = await Promise.all(allStaff.map(async (staff) => {
            const allTasks = await Task.find({ assignedTo: staff._id });
            const completedTasks = allTasks.filter(t => t.status === 'Completed');
            const onTimeTasks = completedTasks.filter(t => t.isOnTime === true);

            const totalTasks = allTasks.length;
            const completedCount = completedTasks.length;
            const onTimeCount = onTimeTasks.length;

            const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
            const onTimeRate = completedCount > 0 ? Math.round((onTimeCount / completedCount) * 100) : 0;

            let efficiencyTrend = 'new';
            if (totalTasks > 0) {
                if (onTimeRate >= 85) efficiencyTrend = 'improving';
                else if (onTimeRate >= 60) efficiencyTrend = 'stable';
                else efficiencyTrend = 'needs improvement';
            }

            return {
                _id: staff._id,
                name: staff.name,
                role: staff.role,
                status: staff.status,
                performanceScore: completionRate,
                tasksCompleted: completedCount,
                totalTasksAssigned: totalTasks,
                onTimeCompletionRate: onTimeRate,
                efficiencyTrend,
                pendingTasks: totalTasks - completedCount
            };
        }));

        res.status(200).json({
            success: true,
            count: analytics.length,
            data: analytics
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


