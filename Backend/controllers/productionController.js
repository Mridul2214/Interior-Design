const Task = require('../models/Task');
const Project = require('../models/Project');
const Checklist = require('../models/Checklist');
const { createNotification, notifyByRole } = require('../utils/notificationHelper');

exports.getProductionTasks = async (req, res) => {
    try {
        const { project, status, taskType, assignedTo, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (project) query.project = project;
        if (status) query.status = status;
        if (taskType) query.taskType = taskType;
        if (assignedTo) query.assignedTo = assignedTo;
        
        const skip = (page - 1) * limit;
        
        const tasks = await Task.find(query)
            .populate('project', 'name projectNumber stage')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'fullName')
            .sort({ priority: -1, dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Task.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createProductionTask = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const task = await Task.create(req.body);
        
        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateProductionTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        const oldStatus = task.status;
        
        Object.assign(task, req.body);
        await task.save();
        
        if (task.status === 'Completed' && oldStatus !== 'Completed') {
            const project = await Project.findById(task.project);
            
            await notifyByRole('Production Manager', {
                title: 'Task Completed',
                description: `Task "${task.title}" has been marked as completed.`,
                type: 'Task',
                relatedModel: 'Task',
                relatedId: task._id
            });
            
            const allTasks = await Task.find({ project: task.project });
            const completedTasks = allTasks.filter(t => t.status === 'Completed').length;
            
            if (completedTasks === allTasks.length && allTasks.length > 0) {
                await Project.findByIdAndUpdate(task.project, {
                    productionComplete: true,
                    stage: 'Completed'
                });
                
                await notifyByRole('Accounts Manager', {
                    title: 'All Production Tasks Completed',
                    description: `All tasks for project "${project?.name}" are complete. Ready for final invoicing.`,
                    type: 'Info',
                    relatedModel: 'Project',
                    relatedId: task.project
                });
            }
        }
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProjectPipeline = async (req, res) => {
    try {
        const projects = await Project.find({ stage: { $ne: 'Completed' } })
            .populate('client', 'name phone')
            .select('name projectNumber stage status progress startDate targetEndDate budget spent')
            .sort({ stage: 1, priority: -1 });
        
        const pipeline = {
            design: projects.filter(p => p.stage === 'Design'),
            procurement: projects.filter(p => p.stage === 'Procurement'),
            production: projects.filter(p => p.stage === 'Production')
        };
        
        res.status(200).json({
            success: true,
            data: pipeline
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProductionStats = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const todoTasks = await Task.countDocuments({ status: 'To Do' });
        const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
        const completedTasks = await Task.countDocuments({ status: 'Completed' });
        const blockedTasks = await Task.countDocuments({ status: 'Blocked' });
        
        const activeProjects = await Project.countDocuments({ 
            stage: 'Production',
            status: 'In Progress' 
        });
        
        res.status(200).json({
            success: true,
            data: {
                tasks: {
                    total: totalTasks,
                    todo: todoTasks,
                    inProgress: inProgressTasks,
                    completed: completedTasks,
                    blocked: blockedTasks
                },
                activeProjects
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.reportIssue = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }
        
        task.status = 'Blocked';
        task.notes = (task.notes || '') + `\n[ISSUE - ${new Date().toLocaleString()}]: ${req.body.description}`;
        await task.save();
        
        await notifyByRole('Production Manager', {
            title: 'Issue Reported',
            description: `Issue reported on task "${task.title}": ${req.body.description}`,
            type: 'Error',
            relatedModel: 'Task',
            relatedId: task._id
        });
        
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
