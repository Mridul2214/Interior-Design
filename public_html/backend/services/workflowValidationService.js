const Project = require('../models/Project');
const Task = require('../models/Task');
const MaterialRequest = require('../models/MaterialRequest');

const ALLOWED_TRANSITIONS = {
    'Not Started': ['In Progress', 'On Hold'],
    'In Progress': ['On Hold', 'Completed'],
    'On Hold': ['In Progress', 'Not Started', 'Completed'],
    'Completed': ['In Progress'],
    'Cancelled': []
};

const DESIGN_STATUS_TRANSITIONS = {
    'Not Started': ['In Design'],
    'In Design': ['Under Review'],
    'Under Review': ['In Design', 'Design Complete'],
    'Design Complete': ['Handoff Done'],
    'Handoff Done': []
};

const validateProjectTransition = async (projectId, newStatus) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return { valid: false, message: 'Project not found' };
        }

        const currentStatus = project.status;
        const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

        if (!allowed.includes(newStatus)) {
            return {
                valid: false,
                message: `Invalid status transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.length > 0 ? allowed.join(', ') : 'none'}`
            };
        }

        return { valid: true, project };
    } catch (error) {
        return { valid: false, message: error.message };
    }
};

const validateDesignStatusTransition = async (projectId, newDesignStatus) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return { valid: false, message: 'Project not found' };
        }

        const currentDesignStatus = project.designStatus || 'Not Started';
        const allowed = DESIGN_STATUS_TRANSITIONS[currentDesignStatus] || [];

        if (!allowed.includes(newDesignStatus)) {
            return {
                valid: false,
                message: `Invalid design status transition from "${currentDesignStatus}" to "${newDesignStatus}". Allowed: ${allowed.join(', ') || 'none'}`
            };
        }

        return { valid: true, project };
    } catch (error) {
        return { valid: false, message: error.message };
    }
};

const validateDesignComplete = async (projectId) => {
    try {
        const errors = [];

        const tasks = await Task.find({ project: projectId.toString() });
        if (tasks.length > 0) {
            const incompleteTasks = tasks.filter(t => t.status !== 'Completed');
            if (incompleteTasks.length > 0) {
                errors.push(`${incompleteTasks.length} task(s) are still incomplete`);
            }
        }

        const criticalPendingRevisions = await Task.countDocuments({
            project: projectId.toString(),
            priority: 'Critical',
            status: { $nin: ['Completed'] }
        });
        if (criticalPendingRevisions > 0) {
            errors.push(`${criticalPendingRevisions} critical task(s) pending`);
        }

        return {
            valid: errors.length === 0,
            errors,
            canProceed: errors.length === 0
        };
    } catch (error) {
        return { valid: false, errors: [error.message], canProceed: false };
    }
};

const validateHandoff = async (projectId) => {
    try {
        const errors = [];
        const warnings = [];

        const project = await Project.findById(projectId);
        if (!project) {
            return { valid: false, errors: ['Project not found'] };
        }

        if (project.status !== 'Design Complete' && project.designStatus !== 'Design Complete') {
            if (project.designStatus && project.designStatus !== 'Design Complete') {
                errors.push('Project design status must be "Design Complete"');
            }
        }

        const tasks = await Task.find({ project: projectId.toString() });
        const openTasks = tasks.filter(t => t.status !== 'Completed');
        if (openTasks.length > 0) {
            errors.push(`${openTasks.length} task(s) are still open`);
        }

        const pendingMaterials = await MaterialRequest.countDocuments({
            project: projectId,
            status: 'Pending'
        });
        if (pendingMaterials > 0) {
            errors.push(`${pendingMaterials} material request(s) still pending`);
        }

        const Quotation = require('../models/Quotation');
        const approvedQuote = await Quotation.findOne({
            _id: project.quotation,
            status: { $in: ['Approved', 'Material Approved'] }
        });
        if (!approvedQuote) {
            errors.push('No approved quotation found for this project');
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings,
            canProceed: errors.length === 0,
            project
        };
    } catch (error) {
        return { valid: false, errors: [error.message], canProceed: false };
    }
};

const getWorkflowChecklist = async (projectId) => {
    try {
        const project = await Project.findById(projectId);
        if (!project) {
            return { valid: false, message: 'Project not found' };
        }

        const tasks = await Task.find({ project: projectId.toString() });
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const totalTasks = tasks.length;

        const pendingMaterials = await MaterialRequest.countDocuments({
            project: projectId,
            status: 'Pending'
        });

        const Quotation = require('../models/Quotation');
        const quotation = await Quotation.findById(project.quotation);
        const hasApprovedQuote = quotation && ['Approved', 'Material Approved'].includes(quotation.status);

        return {
            project: project.name,
            designStatus: project.designStatus || 'Not Started',
            tasks: {
                total: totalTasks,
                completed: completedTasks,
                pending: totalTasks - completedTasks,
                percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
            },
            quotation: {
                exists: !!quotation,
                approved: hasApprovedQuote
            },
            materials: {
                pending: pendingMaterials
            },
            checklist: {
                tasksComplete: completedTasks === totalTasks && totalTasks > 0,
                quoteApproved: hasApprovedQuote,
                noPendingMaterials: pendingMaterials === 0,
                canHandoff: completedTasks === totalTasks && totalTasks > 0 && hasApprovedQuote && pendingMaterials === 0
            }
        };
    } catch (error) {
        return { valid: false, message: error.message };
    }
};

module.exports = {
    validateProjectTransition,
    validateDesignStatusTransition,
    validateDesignComplete,
    validateHandoff,
    getWorkflowChecklist,
    ALLOWED_TRANSITIONS,
    DESIGN_STATUS_TRANSITIONS
};
