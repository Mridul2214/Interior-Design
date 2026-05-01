const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

exports.submitLeave = async (req, res) => {
    try {
        const { leaveType, fromDate, toDate, days, reason } = req.body;
        const newLeave = new LeaveRequest({
            user: req.user.id,
            leaveType,
            fromDate,
            toDate,
            days,
            reason,
            status: 'Pending'
        });
        await newLeave.save();
        res.status(201).json({ success: true, data: newLeave });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error submitting leave', error: error.message });
    }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await LeaveRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching leaves', error: error.message });
    }
};

exports.getPendingLeavesForManager = async (req, res) => {
    try {
        const userRole = req.user.role;
        let subordinateRoles = [];

        // Determine which roles this user is allowed to approve leaves for
        if (userRole === 'Project Engineer') {
            subordinateRoles = ['Site Engineer', 'Site Supervisor'];
        } else if (userRole === 'Project Manager') {
            subordinateRoles = ['Project Engineer'];
        } else if (userRole === 'Admin') {
            subordinateRoles = ['Project Manager', 'Project Engineer', 'Site Engineer', 'Site Supervisor', 'Procurement Manager', 'Store Manager'];
        } else {
            return res.status(403).json({ success: false, message: 'Not authorized to view pending leaves.' });
        }

        // Find users with subordinate roles
        const subordinates = await User.find({ role: { $in: subordinateRoles } }).select('_id');
        const subordinateIds = subordinates.map(s => s._id);

        const pendingLeaves = await LeaveRequest.find({
            user: { $in: subordinateIds },
            status: 'Pending'
        }).populate('user', 'fullName role').sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: pendingLeaves });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching pending leaves', error: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, managerComments } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const leave = await LeaveRequest.findById(id).populate('user', 'role');
        if (!leave) return res.status(404).json({ success: false, message: 'Leave request not found' });

        // Basic authorization check: Ensure the approver has the right role to approve this user's leave
        const approverRole = req.user.role;
        const requestorRole = leave.user.role;

        let authorized = false;
        if (approverRole === 'Admin') authorized = true;
        if (approverRole === 'Project Manager' && requestorRole === 'Project Engineer') authorized = true;
        if (approverRole === 'Project Engineer' && ['Site Engineer', 'Site Supervisor'].includes(requestorRole)) authorized = true;

        if (!authorized) {
            return res.status(403).json({ success: false, message: 'Not authorized to approve this leave request' });
        }

        leave.status = status;
        leave.approvedBy = req.user.id;
        if (managerComments) leave.managerComments = managerComments;

        await leave.save();
        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error updating leave', error: error.message });
    }
};
