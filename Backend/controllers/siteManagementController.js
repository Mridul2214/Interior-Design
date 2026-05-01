const SiteAttendance = require('../models/SiteAttendance');
const SafetyLog = require('../models/SafetyLog');
const SiteProgressReport = require('../models/SiteProgressReport');
const SupervisorDailyReport = require('../models/SupervisorDailyReport');
const ProductionProject = require('../models/ProductionProject');

// ==========================================
// ATTENDANCE APIs
// ==========================================

// @desc    Submit daily site attendance
// @route   POST /api/production/site/attendance
// @access  Private (SE, SS)
exports.submitAttendance = async (req, res) => {
    try {
        const { projectId, date, records } = req.body;

        // Verify project exists
        const project = await ProductionProject.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        // Check if attendance already exists for this date
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await SiteAttendance.findOne({
            project: projectId,
            date: {
                $gte: attendanceDate,
                $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
            }
        });

        if (attendance) {
            // Update existing
            attendance.records = records;
            attendance.submittedBy = req.user._id;
            await attendance.save();
        } else {
            // Create new
            attendance = await SiteAttendance.create({
                project: projectId,
                date: attendanceDate,
                submittedBy: req.user._id,
                records
            });
        }

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error submitting attendance:', error);
        if (error.code === 11000) {
             return res.status(400).json({ success: false, message: 'Attendance for this date already exists.' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get attendance for a project
// @route   GET /api/production/site/attendance/:projectId
// @access  Private
exports.getProjectAttendance = async (req, res) => {
    try {
        const attendance = await SiteAttendance.find({ project: req.params.projectId })
            .populate('submittedBy', 'fullName role')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: attendance });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==========================================
// SAFETY APIs
// ==========================================

// @desc    Report a safety incident or hazard
// @route   POST /api/production/site/safety
// @access  Private (SE, SS)
exports.reportSafetyIssue = async (req, res) => {
    try {
        const { projectId, type, severity, description, actionTaken, attachments, date } = req.body;

        const project = await ProductionProject.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const safetyLog = await SafetyLog.create({
            project: projectId,
            date: date || new Date(),
            reportedBy: req.user._id,
            type,
            severity,
            description,
            actionTaken,
            attachments
        });

        res.status(201).json({ success: true, data: safetyLog });
    } catch (error) {
        console.error('Error reporting safety issue:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get safety logs for a project
// @route   GET /api/production/site/safety/:projectId
// @access  Private
exports.getProjectSafetyLogs = async (req, res) => {
    try {
        const logs = await SafetyLog.find({ project: req.params.projectId })
            .populate('reportedBy', 'fullName role')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        console.error('Error fetching safety logs:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update safety log status (e.g. mark Resolved)
// @route   PATCH /api/production/site/safety/:logId
// @access  Private (SE, SS, PM)
exports.updateSafetyLogStatus = async (req, res) => {
    try {
        const { status, actionTaken } = req.body;
        
        const log = await SafetyLog.findById(req.params.logId);
        if (!log) {
            return res.status(404).json({ success: false, message: 'Safety log not found' });
        }

        if (status) log.status = status;
        if (actionTaken) log.actionTaken = actionTaken;

        await log.save();

        res.status(200).json({ success: true, data: log });
    } catch (error) {
        console.error('Error updating safety log:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==========================================
// DAILY PROGRESS REPORTS
// ==========================================

// @desc    Submit daily site progress report
// @route   POST /api/production/site/reports
// @access  Private (SE, SS)
exports.submitDailyReport = async (req, res) => {
    try {
        const { projectId, reportDate, workStatus, weather, workDone, workersPresent, issues, nextDayPlan } = req.body;

        const project = await ProductionProject.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const report = await SiteProgressReport.create({
            project: projectId,
            date: reportDate || new Date(),
            submittedBy: req.user._id,
            workStatus,
            weather,
            workDone,
            workersPresent,
            issues,
            nextDayPlan
        });

        const populatedReport = await SiteProgressReport.findById(report._id)
            .populate('submittedBy', 'fullName role')
            .populate('project', 'projectName');

        res.status(201).json({ success: true, data: populatedReport });
    } catch (error) {
        console.error('Error submitting daily report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get daily progress reports for a project
// @route   GET /api/production/site/reports/:projectId
// @access  Private
exports.getProjectReports = async (req, res) => {
    try {
        const query = req.params.projectId === 'all' ? {} : { project: req.params.projectId };
        const reports = await SiteProgressReport.find(query)
            .populate('submittedBy', 'fullName role')
            .populate('project', 'projectName')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching project reports:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==========================================
// SUPERVISOR REPORTS
// ==========================================

// @desc    Submit supervisor daily report
// @route   POST /api/production/site/supervisor-reports
// @access  Private (SS)
exports.submitSupervisorReport = async (req, res) => {
    try {
        const { projectId, reportDate, materialReceived, materialUsed, equipmentStatus, laborCount, comments } = req.body;

        const project = await ProductionProject.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        const report = await SupervisorDailyReport.create({
            project: projectId,
            date: reportDate || new Date(),
            submittedBy: req.user._id,
            materialReceived,
            materialUsed,
            equipmentStatus,
            laborCount,
            comments
        });

        const populatedReport = await SupervisorDailyReport.findById(report._id)
            .populate('submittedBy', 'fullName role')
            .populate('project', 'projectName');

        res.status(201).json({ success: true, data: populatedReport });
    } catch (error) {
        console.error('Error submitting supervisor report:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get supervisor reports for a project
// @route   GET /api/production/site/supervisor-reports/:projectId
// @access  Private
exports.getSupervisorReports = async (req, res) => {
    try {
        const query = req.params.projectId === 'all' ? {} : { project: req.params.projectId };
        const reports = await SupervisorDailyReport.find(query)
            .populate('submittedBy', 'fullName role')
            .populate('project', 'projectName')
            .sort({ date: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        console.error('Error fetching supervisor reports:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
