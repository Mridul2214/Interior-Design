const SiteVisit = require('../models/SiteVisit');
const Staff = require('../models/Staff');

// @desc    Get all site visits
// @route   GET /api/site-visits
// @access  Private
exports.getSiteVisits = async (req, res) => {
    try {
        let query = {};

        // If staff, only show their visits
        if (req.user.role === 'Staff') {
            const staffMember = await Staff.findOne({ email: req.user.email });
            if (staffMember) {
                query.staff = staffMember._id;
            }
        }

        const visits = await SiteVisit.find(query)
            .populate('staff', 'name profileImage')
            .populate('client', 'name')
            .populate('task', 'title')
            .sort({ visitDate: -1 });

        res.status(200).json({
            success: true,
            count: visits.length,
            data: visits
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create a site visit
// @route   POST /api/site-visits
// @access  Private
exports.createSiteVisit = async (req, res) => {
    try {
        // Find staff ID from user email
        const staffMember = await Staff.findOne({ email: req.user.email });
        if (!staffMember && req.user.role === 'Staff') {
            return res.status(404).json({ success: false, message: 'Staff profile not found' });
        }

        const visitData = {
            ...req.body,
            staff: staffMember ? staffMember._id : req.body.staff // Admin can specify staff
        };

        const visit = await SiteVisit.create(visitData);

        res.status(201).json({
            success: true,
            data: visit
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get site visits for a specific task
// @route   GET /api/site-visits/task/:taskId
// @access  Private
exports.getTaskVisits = async (req, res) => {
    try {
        const visits = await SiteVisit.find({ task: req.params.taskId })
            .populate('staff', 'name profileImage')
            .sort({ visitDate: -1 });

        res.status(200).json({
            success: true,
            count: visits.length,
            data: visits
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
