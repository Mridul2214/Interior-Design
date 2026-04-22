const Checklist = require('../models/Checklist');
const Project = require('../models/Project');
const { createNotification, notifyByRole } = require('../utils/notificationHelper');

exports.getChecklist = async (req, res) => {
    try {
        const checklist = await Checklist.findOne({ project: req.params.projectId })
            .populate('createdBy', 'fullName');
        
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found for this project'
            });
        }
        
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

exports.createChecklist = async (req, res) => {
    try {
        req.body.project = req.params.projectId;
        req.body.createdBy = req.user.id;
        
        const existing = await Checklist.findOne({ project: req.params.projectId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Checklist already exists for this project'
            });
        }
        
        const checklist = await Checklist.create(req.body);
        
        res.status(201).json({
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

exports.updateChecklistStep = async (req, res) => {
    try {
        const { projectId, stepId } = req.params;
        const { status, notes, images } = req.body;
        
        const checklist = await Checklist.findOne({ project: projectId });
        
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }
        
        const step = checklist.steps.id(stepId);
        
        if (!step) {
            return res.status(404).json({
                success: false,
                message: 'Step not found'
            });
        }
        
        if (status) {
            step.status = status;
            if (status === 'In Progress' && !step.startedAt) {
                step.startedAt = new Date();
            }
            if (status === 'Completed') {
                step.completedAt = new Date();
            }
        }
        
        if (notes !== undefined) step.notes = notes;
        if (images) step.images = [...(step.images || []), ...images];
        
        await checklist.save();
        
        const project = await Project.findById(projectId);
        
        if (checklist.progress === 100 && project) {
            project.handoverComplete = true;
            await project.save();
            
            await createNotification({
                title: 'Project Checklist Completed',
                description: `All checklist steps for project "${project.name}" are completed.`,
                type: 'Success',
                relatedModel: 'Project',
                relatedId: project._id
            });
            
            await notifyByRole('Accounts Manager', {
                title: 'Project Ready for Invoicing',
                description: `Project "${project.name}" checklist is complete. Ready for final invoicing.`,
                type: 'Info',
                relatedModel: 'Project',
                relatedId: project._id
            });
        }
        
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

exports.addChecklistStep = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { name, order } = req.body;
        
        const checklist = await Checklist.findOne({ project: projectId });
        
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }
        
        checklist.steps.push({
            name,
            order: order || checklist.steps.length + 1,
            status: 'Pending'
        });
        
        await checklist.save();
        
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

exports.deleteChecklistStep = async (req, res) => {
    try {
        const { projectId, stepId } = req.params;
        
        const checklist = await Checklist.findOne({ project: projectId });
        
        if (!checklist) {
            return res.status(404).json({
                success: false,
                message: 'Checklist not found'
            });
        }
        
        checklist.steps.pull(stepId);
        await checklist.save();
        
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
