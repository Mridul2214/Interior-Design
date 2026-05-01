const Approval = require('../models/Approval');

exports.getApprovals = async (req, res) => {
    try {
        const approvals = await Approval.find().sort({ submittedDate: -1 });
        res.status(200).json({ success: true, data: approvals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createApproval = async (req, res) => {
    try {
        const approval = await Approval.create(req.body);
        res.status(201).json({ success: true, data: approval });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.updateApproval = async (req, res) => {
    try {
        const approval = await Approval.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!approval) {
            return res.status(404).json({ success: false, message: 'Approval request not found' });
        }
        res.status(200).json({ success: true, data: approval });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteApproval = async (req, res) => {
    try {
        const approval = await Approval.findByIdAndDelete(req.params.id);
        if (!approval) {
            return res.status(404).json({ success: false, message: 'Approval request not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
