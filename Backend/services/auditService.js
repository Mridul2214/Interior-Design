const AuditLog = require('../models/AuditLog');

const logAction = async (options) => {
    try {
        const {
            userId,
            action,
            module,
            referenceId,
            referenceModel,
            oldValue = null,
            newValue = null,
            description = '',
            ipAddress = null,
            userAgent = null
        } = options;

        const auditEntry = await AuditLog.create({
            userId,
            action,
            module,
            referenceId,
            referenceModel,
            oldValue,
            newValue,
            description,
            ipAddress,
            userAgent
        });

        return auditEntry;
    } catch (error) {
        console.error('Audit log error:', error.message);
        return null;
    }
};

const getAuditLogs = async (filters = {}, pagination = { page: 1, limit: 50 }) => {
    try {
        const { userId, module, action, referenceId, startDate, endDate } = filters;
        const { page, limit } = pagination;

        let query = {};

        if (userId) query.userId = userId;
        if (module) query.module = module;
        if (action) query.action = action;
        if (referenceId) query.referenceId = referenceId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .populate('userId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        return {
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('Get audit logs error:', error.message);
        return { success: false, message: error.message };
    }
};

module.exports = {
    logAction,
    getAuditLogs
};
