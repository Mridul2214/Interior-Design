const User = require('../models/User');

exports.getUsers = async (req, res) => {
    try {
        const { search, role, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) query.role = role;
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('createdBy', 'fullName');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        let user = await User.create(req.body);

        // Auto-create a Staff record if this user is a departmental staff/manager
        const staffRoles = ['Design Manager', 'Design Staff', 'Procurement Manager', 'Procurement Staff', 'Production Manager', 'Production Staff', 'Accounts Manager', 'Accounts Staff'];

        if (staffRoles.includes(user.role)) {
            const Staff = require('../models/Staff');
            // Check if phone was provided, if not use a placeholder to pass validation if strictly needed
            const staffRecord = await Staff.create({
                name: user.fullName,
                email: user.email,
                phone: user.phone || '0000000000',
                role: user.role,
                joiningDate: new Date(),
                status: user.status || 'Active',
                createdBy: req.user.id
            });

            // Link the generated staffId back to the user
            user = await User.findByIdAndUpdate(user._id, { staffId: staffRecord.staffId }, { new: true });
        }

        user.password = undefined;
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields
        user.fullName = req.body.fullName || user.fullName;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.role = req.body.role || user.role;
        user.status = req.body.status || user.status;

        // Update password if provided
        if (req.body.password) {
            user.password = req.body.password;
        }

        await user.save();

        // Sync updates to the associated Staff record if it exists
        if (user.staffId) {
            const Staff = require('../models/Staff');
            await Staff.findOneAndUpdate(
                { staffId: user.staffId },
                {
                    name: user.fullName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    status: user.status
                }
            );
        }

        user.password = undefined;
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A user with this email or staff ID already exists'
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If this user is also a Staff member, delete the Staff record to prevent orphans
        if (user.staffId) {
            const Staff = require('../models/Staff');
            await Staff.findOneAndDelete({ staffId: user.staffId });
        }

        await user.deleteOne();
        res.status(200).json({ success: true, message: 'User deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserStats = async (req, res) => {
    try {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ status: 'Active' });
        const inactive = await User.countDocuments({ status: 'Inactive' });

        const byRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            data: { total, active, inactive, byRole }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
