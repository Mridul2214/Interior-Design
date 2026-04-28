const Task = require('../models/Task');
const MaterialRequest = require('../models/MaterialRequest');
const { createNotification, notifyStaffUser } = require('../utils/notificationHelper');
const { logAction } = require('../services/auditService');

const DUPLICATE_SUBMIT_WINDOW = 5000; // 5 seconds

exports.getTasks = async (req, res) => {
    try {
        const { search, status, priority, assignedTo, page = 1, limit = 1000, includeOverdue } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) {
            if (status.includes(',')) {
                query.status = { $in: status.split(',') };
            } else {
                query.status = status;
            }
        }
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (includeOverdue === 'true') query.isOverdue = true;

        // Automatically filter for staff users (Flexible role check)
        const roleLower = req.user.role.toLowerCase();
        const isSales = roleLower.includes('sales');
        const isStaff = (roleLower.includes('staff') || roleLower.includes('designer') || isSales) && !roleLower.includes('manager') && !roleLower.includes('admin');

        if (isStaff) {
            const Staff = require('../models/Staff');
            const staffMember = await Staff.findOne({ email: req.user.email });
            if (staffMember) {
                if (isSales) {
                    // Sales can see tasks assigned to them OR tasks pending sales review
                    query.$or = [
                        { assignedTo: staffMember._id },
                        { status: 'Pending Sales Review' }
                    ];
                } else {
                    query.assignedTo = staffMember._id;
                }
            } else if (!isSales) {
                // If not found in staff model and not sales, return empty
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

        const skip = (page - 1) * limit;
        const tasks = await Task.find(query)
            .populate('assignedTo', 'name role email phone staffId')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount client items')
            .populate('project', 'name projectNumber stage status')
            .populate('team', 'name')
            .populate('createdBy', 'fullName')
            .populate('comments.user', 'fullName email role')
            .sort({ isOverdue: -1, dueDate: 1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Task.countDocuments(query);

        // Update overdue flags for tasks
        const now = new Date();
        for (const task of tasks) {
            if (task.dueDate && new Date(task.dueDate) < now && task.status !== 'Completed' && !task.isOverdue) {
                task.isOverdue = true;
                await task.save();
            }
        }

        res.status(200).json({
            success: true,
            count: tasks.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: tasks
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount')
            .populate('project', 'name projectNumber stage status')
            .populate('team', 'name')
            .populate('createdBy', 'fullName');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        // Sanitize ObjectId fields to prevent casting errors from empty strings
        ['project', 'quotation', 'client', 'team'].forEach(field => {
            if (req.body[field] === '') {
                delete req.body[field];
            }
        });

        if (req.body.quotation) {
            const Quotation = require('../models/Quotation');
            const quotation = await Quotation.findById(req.body.quotation);

            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: 'Quotation not found'
                });
            }

            if (quotation.status !== 'Approved' && quotation.status !== 'Design Approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Only approved quotations can be assigned to tasks. Please wait for client approval.'
                });
            }

            // Find associated project
            const Project = require('../models/Project');
            const project = await Project.findOne({ quotation: req.body.quotation });
            if (project) {
                req.body.project = project._id;
            }
        }

        if (req.body.assignedTo && Array.isArray(req.body.assignedTo)) {
            // Already an array
        } else if (req.body.assignedTo) {
            req.body.assignedTo = [req.body.assignedTo];
        }

        req.body.createdBy = req.user.id;
        req.body.timeline = [{
            action: 'created',
            performedBy: req.user.id,
            details: 'Task created',
            timestamp: new Date()
        }];

        const task = await Task.create(req.body);

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name role email phone staffId')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount');

        res.status(201).json({ success: true, data: populatedTask, message: 'Task created successfully' });

        const assignees = Array.isArray(populatedTask.assignedTo) ? populatedTask.assignedTo : [populatedTask.assignedTo];
        
        assignees.forEach(staff => {
            if (staff) {
                createNotification({
                    title: 'New Task Assigned',
                    description: `Task "${populatedTask.title}" assigned to you. Due: ${new Date(populatedTask.dueDate).toLocaleDateString('en-IN')}.`,
                    type: 'Task',
                    relatedModel: 'Task',
                    relatedId: populatedTask._id,
                    createdBy: req.user.id
                });

                if (staff.email) {
                    notifyStaffUser(staff.email, {
                        title: 'New Task Assigned to You',
                        description: `You have been assigned "${populatedTask.title}". Priority: ${populatedTask.priority}. Due: ${new Date(populatedTask.dueDate).toLocaleDateString('en-IN')}.`,
                        type: 'Task',
                        relatedModel: 'Task',
                        relatedId: populatedTask._id,
                        createdBy: req.user.id
                    });
                }
            }
        });

        logAction({
            userId: req.user.id,
            action: 'Task Created',
            module: 'Task',
            referenceId: populatedTask._id,
            referenceModel: 'Task',
            newValue: { title: populatedTask.title, assignedTo: populatedTask.assignedTo?.map(s => s._id) },
            description: `Task "${populatedTask.title}" created and assigned to ${populatedTask.assignedTo?.map(s => s.name).join(', ')}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        // Sanitize ObjectId fields to prevent casting errors from empty strings
        ['project', 'quotation', 'client', 'team'].forEach(field => {
            if (req.body[field] === '') {
                delete req.body[field];
            }
        });

        let task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // Duplicate submit protection
        if (task.lastStatusUpdate && (Date.now() - task.lastStatusUpdate.getTime()) < DUPLICATE_SUBMIT_WINDOW) {
            return res.status(429).json({
                success: false,
                message: 'Please wait before making another update to this task'
            });
        }

        const oldStatus = task.status;
        const oldAssignedTo = task.assignedTo?.toString();
        const oldValues = {
            status: task.status,
            assignedTo: task.assignedTo,
            priority: task.priority,
            dueDate: task.dueDate
        };

        if (req.body.quotation && req.body.quotation !== task.quotation?.toString()) {
            const Quotation = require('../models/Quotation');
            const quotation = await Quotation.findById(req.body.quotation);

            if (!quotation) {
                return res.status(404).json({
                    success: false,
                    message: 'Quotation not found'
                });
            }

            if (quotation.status !== 'Approved' && quotation.status !== 'Design Approved') {
                return res.status(400).json({
                    success: false,
                    message: 'Only approved quotations can be assigned to tasks. Please wait for client approval.'
                });
            }

            // Find associated project
            const Project = require('../models/Project');
            const project = await Project.findOne({ quotation: req.body.quotation });
            if (project) {
                req.body.project = project._id;
            }
        }

        // Build timeline entries
        const timelineUpdates = [];

        if (req.body.status && req.body.status !== oldStatus) {
            let action = 'updated';
            if (req.body.status === 'In Progress') action = 'started';
            else if (req.body.status === 'Completed') action = 'completed';
            else if (req.body.status === 'To Do' && oldStatus === 'Completed') action = 'reopened';

            timelineUpdates.push({
                action,
                performedBy: req.user.id,
                details: `Status changed from "${oldStatus}" to "${req.body.status}"`,
                oldValue: oldStatus,
                newValue: req.body.status,
                timestamp: new Date()
            });
        }

        if (req.body.assignedTo && req.body.assignedTo !== oldAssignedTo) {
            timelineUpdates.push({
                action: 'reassigned',
                performedBy: req.user.id,
                details: `Task reassigned`,
                oldValue: oldAssignedTo,
                newValue: req.body.assignedTo,
                timestamp: new Date()
            });
        }

        // Merge updates
        Object.keys(req.body).forEach(key => {
            if (key !== 'timeline' && key !== 'lastStatusUpdate') {
                task[key] = req.body[key];
            }
        });

        if (timelineUpdates.length > 0) {
            task.timeline.push(...timelineUpdates);
            task.lastStatusUpdate = new Date();
        }

        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount')
            .populate('comments.user', 'fullName email role');

        res.status(200).json({ success: true, data: updatedTask, message: 'Task updated successfully' });

        if (req.body.status && req.body.status !== oldStatus) {
            createNotification({
                title: `Task Status: ${req.body.status}`,
                description: `Task "${task.title}" status changed from "${oldStatus}" to "${req.body.status}".`,
                type: req.body.status === 'Completed' ? 'Success' : 'Task',
                relatedModel: 'Task',
                relatedId: task._id,
                createdBy: req.user.id
            });

            if (task.assignedTo?.email) {
                notifyStaffUser(task.assignedTo.email, {
                    title: `Your Task Updated`,
                    description: `Task "${task.title}" status changed to "${req.body.status}".`,
                    type: req.body.status === 'Completed' ? 'Success' : 'Task',
                    relatedModel: 'Task',
                    relatedId: task._id,
                    createdBy: req.user.id
                });
            }

            if (req.body.status === 'Completed') {
                logAction({
                    userId: req.user.id,
                    action: 'Task Completed',
                    module: 'Task',
                    referenceId: task._id,
                    referenceModel: 'Task',
                    oldValue: { status: oldStatus },
                    newValue: { status: 'Completed', completedAt: new Date() },
                    description: `Task "${task.title}" marked as completed`
                });
            }
        }

        if (req.body.assignedTo && req.body.assignedTo !== oldAssignedTo) {
            notifyStaffUser(task.assignedTo.email, {
                title: 'Task Reassigned to You',
                description: `You have been assigned "${task.title}". Priority: ${task.priority}. Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')}.`,
                type: 'Task',
                relatedModel: 'Task',
                relatedId: task._id,
                createdBy: req.user.id
            });

            logAction({
                userId: req.user.id,
                action: 'Task Reassigned',
                module: 'Task',
                referenceId: task._id,
                referenceModel: 'Task',
                oldValue: { assignedTo: oldAssignedTo },
                newValue: { assignedTo: req.body.assignedTo },
                description: `Task "${task.title}" reassigned from ${oldAssignedTo} to ${req.body.assignedTo}`
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        await task.deleteOne();
        res.status(200).json({ success: true, message: 'Task deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitTask = async (req, res) => {
    try {
        const { staffNotes, files, designItems } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const Staff = require('../models/Staff');
        const staffMember = await Staff.findOne({ email: req.user.email });

        const submission = {
            files: files || [],
            staffNotes,
            designItems: designItems || [],
            submittedBy: staffMember ? staffMember._id : null,
            submittedAt: new Date(),
            status: 'Pending Review'
        };

        task.submissions.push(submission);
        task.status = 'Review Pending';
        task.timeline.push({
            action: 'submitted',
            performedBy: req.user.id,
            details: `Design files submitted by ${staffMember ? staffMember.name : req.user.fullName}`,
            timestamp: new Date()
        });

        // Sanitize potentially corrupted fields that cause casting errors
        const fieldsToFix = ['project', 'quotation', 'client', 'team'];
        fieldsToFix.forEach(field => {
            if (task[field] === '' || (task[field] && typeof task[field] === 'string' && task[field].trim() === '')) {
                console.log(`Fixing corrupted ${field} field for task ${task._id}`);
                task[field] = undefined;
            }
        });

        await task.save();

        res.status(200).json({ success: true, data: task, message: 'Task submitted for review' });

        createNotification({
            title: 'Task Submitted',
            description: `Design files submitted for task "${task.title}" by ${staffMember ? staffMember.name : req.user.fullName}.`,
            type: 'Info',
            relatedModel: 'Task',
            relatedId: task._id,
            createdBy: req.user.id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reviewSubmission = async (req, res) => {
    try {
        const { submissionId, status, managerFeedback } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const submission = task.submissions.id(submissionId);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        submission.status = status;
        submission.managerFeedback = managerFeedback;
        submission.reviewedAt = new Date();
        submission.reviewedBy = req.user.id;

        if (status === 'Approved' || status === 'Pending Sales Review') {
            task.status = 'Pending Sales Review';
            task.timeline.push({
                action: 'approved',
                performedBy: req.user.id,
                details: 'Design approved by manager',
                timestamp: new Date()
            });
        } else if (status === 'Revision Required') {
            task.status = 'Revision Required';
            task.timeline.push({
                action: 'revisionRequested',
                performedBy: req.user.id,
                details: `Revision requested: ${managerFeedback}`,
                timestamp: new Date()
            });
        }

        await task.save();

        res.status(200).json({ success: true, data: task, message: `Submission ${status.toLowerCase()} successfully` });

        // Notify assignees
        const Staff = require('../models/Staff');
        const assignees = await Staff.find({ _id: { $in: task.assignedTo } });

        assignees.forEach(staff => {
            notifyStaffUser(staff.email, {
                title: `Task ${status}`,
                description: `Manager has ${status.toLowerCase()} your submission for "${task.title}".${managerFeedback ? ` Feedback: ${managerFeedback}` : ''}`,
                type: status === 'Approved' ? 'Success' : 'Warning',
                relatedModel: 'Task',
                relatedId: task._id,
                createdBy: req.user.id
            });
        });

        if (status === 'Approved' || status === 'Pending Sales Review') {
            const { notifyByRole } = require('../utils/notificationHelper');
            const designerNames = assignees.map(a => a.name).join(', ') || 'the design team';
            notifyByRole('Sales', {
                title: '🎨 New Design for Review',
                description: `Design approved by manager for "${task.title}". Submitted by: ${designerNames}. Please review and present to client.`,
                type: 'Info',
                relatedModel: 'Task',
                relatedId: task._id
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.pushToProcurement = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('quotation');
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        // If project is missing on task, try to get it from the associated Project model
        if (!task.project && task.quotation) {
            const Project = require('../models/Project');
            const project = await Project.findOne({ quotation: task.quotation._id });
            if (project) {
                task.project = project._id;
            }
        }

        if (!task.project) {
            return res.status(400).json({ success: false, message: 'Task is not associated with a project. Please link a project before pushing to procurement.' });
        }

        if (task.status !== 'Approved') {
            return res.status(400).json({ success: false, message: 'Only approved designs can be pushed to procurement' });
        }

        task.status = 'Pushed to Procurement';
        task.timeline.push({
            action: 'pushed',
            performedBy: req.user.id,
            details: 'Finalized design pushed to procurement team',
            timestamp: new Date()
        });

        let materialRequest = null;
        // Map items if quotation exists, otherwise start with empty items
        const materialRequestItems = (task.quotation && task.quotation.items) 
            ? task.quotation.items.map(item => ({
                itemName: item.itemName,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit || 'SCM',
                specifications: item.material ? `${item.material} - ${item.finish || 'Standard'}` : null,
                status: 'Pending'
            }))
            : [];

        materialRequest = await MaterialRequest.create({
            project: task.project,
            quotation: task.quotation ? task.quotation._id : null,
            items: materialRequestItems,
            priority: 'Medium',
            status: 'Pending',
            requestedBy: req.user.id,
            createdBy: req.user.id,
            isPushedFromDesign: true,
            notes: `Design handoff from task: ${task.title}. ${materialRequestItems.length === 0 ? 'PLEASE REVIEW AND ADD MATERIALS.' : ''}`
        });

        await Project.findByIdAndUpdate(task.project, {
            stage: 'Procurement'
        });

        if (task.quotation) {
            task.quotation.status = 'Sent to Procurement';
            await task.quotation.save();
        }

        if (task.project) {
            const Project = require('../models/Project');
            const project = await Project.findById(task.project);
            if (project && project.stage !== 'Procurement') {
                project.stage = 'Procurement';
                project.designComplete = true;
                await project.save();
            }
        }

        await task.save();

        res.status(200).json({ 
            success: true, 
            data: task, 
            materialRequest,
            message: 'Design pushed to procurement successfully' 
        });

        createNotification({
            title: 'Design Pushed to Procurement',
            description: `Design for project "${task.title}" has been moved to procurement phase.`,
            type: 'Success',
            relatedModel: 'Task',
            relatedId: task._id,
            createdBy: req.user.id
        });

        const { notifyByRole } = require('../utils/notificationHelper');
        notifyByRole('Procurement Manager', {
            title: 'New Material Request',
            description: materialRequest 
                ? `New material request "${materialRequest.requestNumber}" created from design.`
                : `Design "${task.title}" pushed to procurement for processing.`,
            type: 'Info',
            relatedModel: materialRequest ? 'MaterialRequest' : 'Task',
            relatedId: materialRequest ? materialRequest._id : task._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sales approves/rejects design
exports.salesApproveTask = async (req, res) => {
    try {
        const { approved, salesNotes } = req.body;
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.status !== 'Pending Sales Review') {
            return res.status(400).json({ success: false, message: 'Task is not pending sales review' });
        }

        task.status = approved ? 'Sales Approved' : 'Revision Required';
        task.timeline.push({
            action: 'salesApproved',
            performedBy: req.user.id,
            details: approved
                ? `Sales approved design. Notes: ${salesNotes || 'None'}`
                : `Sales rejected design. Reason: ${salesNotes || 'None'}`,
            timestamp: new Date()
        });
        await task.save();

        res.status(200).json({ success: true, data: task, message: approved ? 'Design approved by Sales' : 'Design sent back for revision' });

        // Notify Design Manager
        const { notifyByRole } = require('../utils/notificationHelper');
        notifyByRole('Design Manager', {
            title: approved ? '✅ Sales Approved Design' : '⚠️ Sales Rejected Design',
            description: approved
                ? `Sales team approved design for "${task.title}". Please push to Admin for final review.`
                : `Sales team rejected design for "${task.title}". Reason: ${salesNotes}. Please coordinate revision.`,
            type: approved ? 'Success' : 'Warning',
            relatedModel: 'Task',
            relatedId: task._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Manager sends approved design to Superadmin
exports.managerSendToAdmin = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.status !== 'Sales Approved') {
            return res.status(400).json({ success: false, message: 'Design must be Sales Approved before sending to Admin' });
        }

        task.status = 'Pending Admin Review';
        task.timeline.push({
            action: 'sentToAdmin',
            performedBy: req.user.id,
            details: 'Design and item list forwarded to Superadmin for final approval',
            timestamp: new Date()
        });
        await task.save();

        res.status(200).json({ success: true, data: task, message: 'Design sent to Superadmin for review' });

        // Notify Superadmin
        const { notifyByRole } = require('../utils/notificationHelper');
        notifyByRole('Superadmin', {
            title: '📋 Design Pending Your Approval',
            description: `Design Manager submitted "${task.title}" for final approval. Review the design and item list to push to procurement.`,
            type: 'Info',
            relatedModel: 'Task',
            relatedId: task._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Superadmin reviews and approves/rejects design
exports.adminReviewDesign = async (req, res) => {
    try {
        const { approved, rejectionReason, approvedBudget } = req.body;
        const task = await Task.findById(req.params.id).populate('quotation');
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        if (task.status !== 'Pending Admin Review') {
            return res.status(400).json({ success: false, message: 'Task is not pending admin review' });
        }

        if (!approved) {
            // Admin rejects — send back to manager for redo
            task.status = 'Admin Rejected';
            task.timeline.push({
                action: 'adminReviewed',
                performedBy: req.user.id,
                details: `Admin rejected design. Reason: ${rejectionReason || 'Not specified'}`,
                timestamp: new Date()
            });
            await task.save();

            res.status(200).json({ success: true, data: task, message: 'Design rejected and sent back for revision' });

            const { notifyByRole } = require('../utils/notificationHelper');
            notifyByRole('Design Manager', {
                title: '❌ Admin Rejected Design',
                description: `Superadmin rejected "${task.title}". Reason: ${rejectionReason}. Please coordinate with your team to redo.`,
                type: 'Error',
                relatedModel: 'Task',
                relatedId: task._id
            });
            return;
        }

        // Admin approves — push to procurement
        if (!task.project && task.quotation) {
            const Project = require('../models/Project');
            const project = await Project.findOne({ quotation: task.quotation._id });
            if (project) task.project = project._id;
        }

        task.status = 'Pushed to Procurement';
        task.timeline.push({
            action: 'adminReviewed',
            performedBy: req.user.id,
            details: 'Admin approved design and pushed to procurement',
            timestamp: new Date()
        });

        // Build material request from designItems in latest submission
        const latestSubmission = task.submissions?.[task.submissions.length - 1];
        const designItems = latestSubmission?.designItems || [];
        const materialRequestItems = designItems.map(item => ({
            itemName: item.name,
            description: `Size: ${item.size || 'N/A'}`,
            quantity: item.quantity || 1,
            unit: item.unit || 'pcs',
            status: 'Pending'
        }));

        let materialRequest = null;
        if (task.project) {
            // Auto-assign to a procurement staff
            const User = require('../models/User');
            const procStaff = await User.find({ role: 'Procurement Staff', status: 'Active' });
            let assignedTo = null;
            let mrStatus = 'Pending';
            
            if (procStaff && procStaff.length > 0) {
                // Round-robin or simple first assignment
                assignedTo = procStaff[Math.floor(Math.random() * procStaff.length)]._id;
                mrStatus = 'Assigned';
            }

            materialRequest = await MaterialRequest.create({
                project: task.project,
                quotation: task.quotation ? task.quotation._id : null,
                items: materialRequestItems,
                priority: 'Medium',
                status: mrStatus,
                requestedBy: req.user.id,
                createdBy: req.user.id,
                assignedTo: assignedTo,
                approvedBudget: approvedBudget || 0,
                isPushedFromDesign: true,
                notes: `Admin-approved design handoff from task: ${task.title}.`
            });

            if (assignedTo) {
                const { notifyUser } = require('../utils/notificationHelper');
                notifyUser(assignedTo, {
                    title: 'New Auto-Assigned Handoff',
                    description: `You have been auto-assigned to handle procurement for "${task.title}".`,
                    type: 'Info',
                    relatedModel: 'MaterialRequest',
                    relatedId: materialRequest._id
                });
            }

            const Project = require('../models/Project');
            await Project.findByIdAndUpdate(task.project, { stage: 'Procurement', designComplete: true });
        }

        if (task.quotation) {
            task.quotation.status = 'Sent to Procurement';
            await task.quotation.save();
        }

        await task.save();

        res.status(200).json({ success: true, data: task, materialRequest, message: 'Design approved and pushed to procurement' });

        createNotification({
            title: '🚀 Design Pushed to Procurement',
            description: `Admin approved "${task.title}" and it has been forwarded to procurement.`,
            type: 'Success',
            relatedModel: 'Task',
            relatedId: task._id,
            createdBy: req.user.id
        });

        const { notifyByRole } = require('../utils/notificationHelper');
        notifyByRole('Procurement Manager', {
            title: 'New Material Request from Design',
            description: `Design "${task.title}" approved by admin. Material request created with ${materialRequestItems.length} item(s).`,
            type: 'Info',
            relatedModel: materialRequest ? 'MaterialRequest' : 'Task',
            relatedId: materialRequest ? materialRequest._id : task._id
        });
        notifyByRole('Design Manager', {
            title: '✅ Admin Approved — Procurement Notified',
            description: `Design "${task.title}" was approved by Superadmin and has been pushed to the Procurement team.`,
            type: 'Success',
            relatedModel: 'Task',
            relatedId: task._id
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const comment = {
            user: req.user.id,
            text: text.trim(),
            createdAt: new Date()
        };

        task.comments.push(comment);
        task.timeline.push({
            action: 'commented',
            performedBy: req.user.id,
            details: `Comment added: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
            timestamp: new Date()
        });

        await task.save();

        const updatedTask = await Task.findById(req.params.id)
            .populate('assignedTo', 'name role email phone')
            .populate('comments.user', 'fullName email role');

        res.status(201).json({ success: true, data: updatedTask, message: 'Comment added successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTaskComments = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .select('comments')
            .populate('comments.user', 'fullName email role');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            count: task.comments.length,
            data: task.comments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTaskTimeline = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .select('timeline')
            .populate('timeline.performedBy', 'fullName email role');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        res.status(200).json({
            success: true,
            count: task.timeline.length,
            data: task.timeline
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.reassignTask = async (req, res) => {
    try {
        const { assignedTo, staffIds, reason } = req.body;
        // Support both single 'assignedTo' or array 'staffIds'
        const newAssignees = staffIds || (Array.isArray(assignedTo) ? assignedTo : [assignedTo]);

        if (!newAssignees || newAssignees.length === 0 || !newAssignees[0]) {
            return res.status(400).json({ success: false, message: 'At least one assignee is required' });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const oldAssignees = task.assignedTo;
        const Staff = require('../models/Staff');
        const staffMembers = await Staff.find({ _id: { $in: newAssignees } });

        if (staffMembers.length === 0) {
            return res.status(404).json({ success: false, message: 'No valid assignees found' });
        }

        await Task.findByIdAndUpdate(req.params.id, {
            $set: {
                assignedTo: newAssignees,
                lastStatusUpdate: new Date()
            },
            $push: {
                timeline: {
                    action: 'reassigned',
                    performedBy: req.user.id,
                    details: reason || `Task reassigned to ${staffMembers.map(s => s.name).join(', ')}`,
                    oldValue: oldAssignees,
                    newValue: newAssignees,
                    timestamp: new Date()
                }
            }
        });

        const updatedTask = await Task.findById(req.params.id)
            .populate('assignedTo', 'name role email phone')
            .populate('client', 'name email phone')
            .populate('quotation', 'quotationNumber projectName totalAmount');

        res.status(200).json({ success: true, data: updatedTask, message: 'Task reassigned successfully' });

        // Notify new assignees
        staffMembers.forEach(staff => {
            if (staff.email) {
                notifyStaffUser(staff.email, {
                    title: 'Task Reassigned to You',
                    description: `You have been assigned "${task.title}". Priority: ${task.priority}. Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')}.${reason ? ` Reason: ${reason}` : ''}`,
                    type: 'Task',
                    relatedModel: 'Task',
                    relatedId: task._id,
                    createdBy: req.user.id
                });
            }
        });

        logAction({
            userId: req.user.id,
            action: 'Task Reassigned',
            module: 'Task',
            referenceId: task._id,
            referenceModel: 'Task',
            oldValue: { assignedTo: oldAssignees },
            newValue: { assignedTo: newAssignees, reason },
            description: `Task "${task.title}" reassigned to ${staffMembers.map(s => s.name).join(', ')}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTaskStats = async (req, res) => {
    try {
        const total = await Task.countDocuments();
        const todo = await Task.countDocuments({ status: 'To Do' });
        const inProgress = await Task.countDocuments({ status: 'In Progress' });
        const completed = await Task.countDocuments({ status: 'Completed' });
        const blocked = await Task.countDocuments({ status: 'Blocked' });

        const overdue = await Task.countDocuments({
            dueDate: { $lt: new Date() },
            status: { $ne: 'Completed' }
        });

        const urgent = await Task.countDocuments({ priority: 'Critical' });

        res.status(200).json({
            success: true,
            data: { total, todo, inProgress, completed, blocked, overdue, urgent }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add daily update to task
// @route   POST /api/tasks/:id/daily-update
// @access  Private (Staff)
exports.addDailyUpdate = async (req, res) => {
    try {
        const { update, emergencies, extensionRequest } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        const Staff = require('../models/Staff');
        const staff = await Staff.findOne({ email: req.user.email });

        task.dailyUpdates.push({
            staff: staff ? staff._id : null,
            update,
            emergencies,
            extensionRequest: extensionRequest && extensionRequest.requestedDate ? {
                requestedDate: extensionRequest.requestedDate,
                reason: extensionRequest.reason,
                status: 'Pending'
            } : undefined
        });

        task.timeline.push({
            action: 'updated',
            performedBy: req.user.id,
            details: `Daily update submitted by ${staff?.name || req.user.fullName}`
        });

        await task.save();

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// End of taskController.js
