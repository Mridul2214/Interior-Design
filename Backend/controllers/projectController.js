const Project = require('../models/Project');
const Quotation = require('../models/Quotation');
const Checklist = require('../models/Checklist');
const Task = require('../models/Task');
const MaterialRequest = require('../models/MaterialRequest');
const { createNotification, notifyByRole } = require('../utils/notificationHelper');
const { logAction } = require('../services/auditService');
const {
    validateProjectTransition,
    validateHandoff,
    validateDesignComplete,
    validateDesignStatusTransition,
    getWorkflowChecklist
} = require('../services/workflowValidationService');

exports.getProjects = async (req, res) => {
    try {
        const { search, stage, status, client, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (search) {
            query.$or = [
                { projectNumber: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (stage) query.stage = stage;
        if (status) query.status = status;
        if (client) query.client = client;
        
        const skip = (page - 1) * limit;
        
        const projects = await Project.find(query)
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber totalAmount')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Project.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client')
            .populate('quotation')
            .populate('createdBy', 'fullName email')
            .populate('assignedDesignManager', 'fullName email')
            .populate('assignedProcurementManager', 'fullName email')
            .populate('assignedProductionManager', 'fullName email');
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createProject = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const project = await Project.create(req.body);
        
        const defaultSteps = [
            { name: 'Demolition', order: 1 },
            { name: 'Cleaning', order: 2 },
            { name: 'Installation', order: 3 },
            { name: 'Final Handover', order: 4 }
        ];
        
        await Checklist.create({
            project: project._id,
            steps: defaultSteps,
            createdBy: req.user.id
        });
        
        await createNotification({
            title: 'New Project Created',
            description: `Project "${project.name}" (${project.projectNumber}) has been created and assigned to Design stage.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id,
            createdBy: req.user.id
        });
        
        await notifyByRole('Design Manager', {
            title: 'New Project Assigned',
            description: `Project "${project.name}" requires design work.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id
        });
        
        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProject = async (req, res) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Validate design status transition if being updated
        if (req.body.designStatus) {
            const validation = await validateDesignStatusTransition(project._id, req.body.designStatus);
            if (!validation.valid) {
                return res.status(400).json({
                    success: false,
                    message: validation.message
                });
            }

            // Check prerequisites for Design Complete
            if (req.body.designStatus === 'Design Complete') {
                const prereqCheck = await validateDesignComplete(project._id);
                if (!prereqCheck.canProceed) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot mark as Design Complete',
                        errors: prereqCheck.errors
                    });
                }
            }
        }

        const oldValues = {};
        if (req.body.designStatus && req.body.designStatus !== project.designStatus) {
            oldValues.designStatus = project.designStatus;
        }
        if (req.body.status && req.body.status !== project.status) {
            oldValues.status = project.status;
        }

        Object.keys(req.body).forEach(key => {
            project[key] = req.body[key];
        });

        await project.save();

        res.status(200).json({
            success: true,
            data: project,
            message: 'Project updated successfully'
        });

        if (oldValues.designStatus) {
            logAction({
                userId: req.user.id,
                action: 'Design Status Changed',
                module: 'Project',
                referenceId: project._id,
                referenceModel: 'Project',
                oldValue: oldValues,
                newValue: { designStatus: req.body.designStatus },
                description: `Project "${project.name}" design status changed to ${req.body.designStatus}`
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.validateHandoff = async (req, res) => {
    try {
        const validation = await validateHandoff(req.params.id);

        res.status(200).json({
            success: true,
            data: validation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.performHandoff = async (req, res) => {
    try {
        const validation = await validateHandoff(req.params.id);

        if (!validation.canProceed) {
            return res.status(400).json({
                success: false,
                message: 'Cannot perform handoff',
                errors: validation.errors
            });
        }

        const project = validation.project;

        project.stage = 'Procurement';
        project.designStatus = 'Handoff Done';
        project.designComplete = true;
        project.handoffDate = new Date();
        project.handedOffBy = req.user.id;
        await project.save();

        await createNotification({
            title: 'Project Handoff Complete',
            description: `Project "${project.name}" has been handed off to Procurement.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id,
            createdBy: req.user.id
        });

        await notifyByRole('Procurement Manager', {
            title: 'New Project Ready for Procurement',
            description: `Project "${project.name}" design is complete and ready for material procurement.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id
        });

        await notifyByRole('Procurement Staff', {
            title: 'New Project Ready for Procurement',
            description: `Project "${project.name}" design is complete and ready for material procurement.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id
        });

        logAction({
            userId: req.user.id,
            action: 'Project Handoff',
            module: 'Handoff',
            referenceId: project._id,
            referenceModel: 'Project',
            newValue: {
                designStatus: 'Handoff Done',
                handoffDate: new Date(),
                handedOffBy: req.user.id
            },
            description: `Project "${project.name}" handed off to Procurement`
        });

        res.status(200).json({
            success: true,
            data: project,
            message: 'Project handed off to Procurement successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getWorkflowChecklist = async (req, res) => {
    try {
        const checklist = await getWorkflowChecklist(req.params.id);

        res.status(200).json({
            success: true,
            data: checklist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProjectStage = async (req, res) => {
    try {
        const { stage, status } = req.body;
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        const previousStage = project.stage;
        
        if (stage) project.stage = stage;
        if (status) project.status = status;
        
        await project.save();
        
        if (stage && stage !== previousStage) {
            let notificationTitle = '';
            let notificationDesc = '';
            
            switch (stage) {
                case 'Design':
                    notificationTitle = 'Project Moved to Design';
                    notificationDesc = `Project "${project.name}" is now in Design stage.`;
                    await notifyByRole('Design Manager', {
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Info',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    break;
                case 'Procurement':
                    project.designComplete = true;
                    await project.save();
                    notificationTitle = 'Design Complete - Procurement Started';
                    notificationDesc = `Project "${project.name}" design is complete. Materials procurement can begin.`;
                    await notifyByRole('Procurement Manager', {
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Info',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    await notifyByRole('Procurement Staff', {
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Info',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    break;
                case 'Production':
                    project.materialsReady = true;
                    await project.save();
                    notificationTitle = 'Materials Ready - Production Started';
                    notificationDesc = `Project "${project.name}" materials are ready. Production can begin.`;
                    await notifyByRole('Production Manager', {
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Info',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    await notifyByRole('Production Staff', {
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Info',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    break;
                case 'Completed':
                    project.productionComplete = true;
                    project.handoverComplete = true;
                    await project.save();
                    notificationTitle = 'Project Completed';
                    notificationDesc = `Project "${project.name}" has been completed successfully!`;
                    await createNotification({
                        title: notificationTitle,
                        description: notificationDesc,
                        type: 'Success',
                        relatedModel: 'Project',
                        relatedId: project._id
                    });
                    break;
            }
        }
        
        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProjectStats = async (req, res) => {
    try {
        const total = await Project.countDocuments();
        const designStage = await Project.countDocuments({ stage: 'Design' });
        const procurementStage = await Project.countDocuments({ stage: 'Procurement' });
        const productionStage = await Project.countDocuments({ stage: 'Production' });
        const completed = await Project.countDocuments({ stage: 'Completed' });
        
        const inProgress = await Project.countDocuments({ status: 'In Progress' });
        const onHold = await Project.countDocuments({ status: 'On Hold' });
        
        const totalBudget = await Project.aggregate([
            { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);
        
        const totalSpent = await Project.aggregate([
            { $group: { _id: null, total: { $sum: '$spent' } } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                total,
                stages: {
                    design: designStage,
                    procurement: procurementStage,
                    production: productionStage,
                    completed: completed
                },
                status: {
                    inProgress,
                    onHold
                },
                budget: {
                    total: totalBudget[0]?.total || 0,
                    spent: totalSpent[0]?.total || 0,
                    remaining: (totalBudget[0]?.total || 0) - (totalSpent[0]?.total || 0)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProjectsByStage = async (req, res) => {
    try {
        const { stage } = req.params;
        
        const projects = await Project.find({ stage })
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber totalAmount')
            .sort({ priority: -1, createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
