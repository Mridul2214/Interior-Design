const ProductionProject = require('../models/ProductionProject');
const ProductionTask = require('../models/ProductionTask');
const ProductionActivityLog = require('../models/ProductionActivityLog');

// Helper for Activity Log
const logActivity = async (projectId, userId, action, message) => {
    await ProductionActivityLog.create({
        projectId,
        userId,
        action,
        message
    });
};

// =======================
// PROJECT APIs
// =======================

exports.createProject = async (req, res) => {
    try {
        // ONLY Admin or Super Admin can create projects
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Access denied. Only Admins can create production projects.' });
        }

        const { projectName, clientId, description, startDate, endDate, projectManager } = req.body;
        
        if (!projectManager) {
            return res.status(400).json({ success: false, message: 'A Project Manager must be assigned during creation.' });
        }

        const project = await ProductionProject.create({
            projectName,
            clientId,
            description,
            startDate,
            endDate,
            projectManager,
            createdBy: req.user.id
        });

        await logActivity(project._id, req.user.id, 'CREATE_PROJECT', `Project "${projectName}" created.`);

        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        let query = {};
        
        // If not Admin/Super Admin, restrict to strictly projects where user is PM
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = { projectManager: req.user.id };
        }

        const projects = await ProductionProject.find(query).populate('clientId', 'name').sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await ProductionProject.findById(req.params.id)
            .populate('clientId', 'name email phone')
            .populate('projectManager', 'fullName email')
            .populate('projectEngineer', 'fullName email')
            .populate('siteEngineer', 'fullName email')
            .populate('siteSupervisor', 'fullName email');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProject = async (req, res) => {
    try {
        const project = await ProductionProject.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        await logActivity(project._id, req.user.id, 'UPDATE_PROJECT', `Project details updated.`);

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignTeam = async (req, res) => {
    try {
        const { projectEngineer, siteEngineer, siteSupervisor } = req.body;
        
        const project = await ProductionProject.findById(req.params.id);
        
        if (projectEngineer) project.projectEngineer = projectEngineer;
        if (siteEngineer) project.siteEngineer = siteEngineer;
        if (siteSupervisor) project.siteSupervisor = siteSupervisor;
        
        await project.save();

        await logActivity(project._id, req.user.id, 'ASSIGN_TEAM', `Team assignments updated.`);

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =======================
// TASK APIs
// =======================

exports.createTask = async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, stage, priority } = req.body;

        const task = await ProductionTask.create({
            title,
            description,
            projectId,
            assignedBy: req.user.id,
            assignedTo,
            stage,
            priority
        });

        await logActivity(projectId, req.user.id, 'CREATE_TASK', `Task "${title}" created for stage ${stage}.`);

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignTask = async (req, res) => {
    try {
        const { assignedTo } = req.body;
        const task = await ProductionTask.findByIdAndUpdate(req.params.taskId, { assignedTo }, { new: true });

        await logActivity(task.projectId, req.user.id, 'ASSIGN_TASK', `Task "${task.title}" reassigned.`);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status, note, images } = req.body;
        const task = await ProductionTask.findById(req.params.taskId);
        
        task.status = status;
        
        if (note || images) {
            task.updates.push({
                note,
                images: images || [],
                updatedBy: req.user.id
            });
        }
        
        await task.save();

        await logActivity(task.projectId, req.user.id, 'UPDATE_TASK', `Task "${task.title}" status changed to ${status}.`);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const tasks = await ProductionTask.find({ projectId: req.params.id })
            .populate('assignedTo', 'fullName')
            .populate('assignedBy', 'fullName')
            .sort({ priority: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =======================
// CONTROL APIs (PM Only)
// =======================

exports.approveTask = async (req, res) => {
    try {
        const task = await ProductionTask.findById(req.params.taskId);
        task.status = 'Approved';
        await task.save();

        await logActivity(task.projectId, req.user.id, 'APPROVE_TASK', `Task "${task.title}" approved by PM.`);

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getDashboardOverview = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = { projectManager: req.user.id };
        }

        const projects = await ProductionProject.find(query);
        const projectIds = projects.map(p => p._id);
        
        const tasks = await ProductionTask.find({ projectId: { $in: projectIds } });
        
        const pendingApprovals = tasks.filter(t => t.status === 'Pending').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const activeProjects = projects.filter(p => p.status === 'Active').length;

        const recentActivity = await ProductionActivityLog.find({ projectId: { $in: projectIds } })
            .populate('userId', 'fullName')
            .sort({ timestamp: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalProjects: projects.length,
                activeProjects,
                pendingApprovals,
                completedTasks,
                projects,
                recentActivity
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPendingApprovals = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = { projectManager: req.user.id };
        }

        const projects = await ProductionProject.find(query);
        const projectIds = projects.map(p => p._id);
        
        const tasks = await ProductionTask.find({ 
            projectId: { $in: projectIds },
            status: 'Pending'
        })
        .populate('projectId', 'projectName')
        .populate('assignedTo', 'fullName')
        .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = { projectManager: req.user.id };
        }

        const projects = await ProductionProject.find(query);
        const projectIds = projects.map(p => p._id);
        
        const tasks = await ProductionTask.find({ projectId: { $in: projectIds } })
            .populate('projectId', 'projectName')
            .populate('assignedTo', 'fullName')
            .sort({ priority: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTeamOverview = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            query = { projectManager: req.user.id };
        }

        const projects = await ProductionProject.find(query)
            .populate('projectEngineer', 'fullName email')
            .populate('siteEngineer', 'fullName email')
            .populate('siteSupervisor', 'fullName email');
            
        const teamMap = new Map();
        
        projects.forEach(project => {
            const roles = [
                { user: project.projectEngineer, title: 'Project Engineer' },
                { user: project.siteEngineer, title: 'Site Engineer' },
                { user: project.siteSupervisor, title: 'Site Supervisor' }
            ];
            
            roles.forEach(role => {
                if (role.user) {
                    const id = role.user._id.toString();
                    if (!teamMap.has(id)) {
                        teamMap.set(id, {
                            id: id,
                            name: role.user.fullName,
                            email: role.user.email,
                            role: role.title,
                            projects: 1
                        });
                    } else {
                        teamMap.get(id).projects += 1;
                    }
                }
            });
        });

        res.status(200).json({ success: true, data: Array.from(teamMap.values()) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// =======================
// ENGINEER APIs
// =======================

// Get projects assigned to this engineer (PE / SE / SS)
exports.getMyProjects = async (req, res) => {
    try {
        const uid = req.user.id;
        const projects = await ProductionProject.find({
            $or: [
                { projectEngineer: uid },
                { siteEngineer:    uid },
                { siteSupervisor:  uid }
            ]
        })
        .populate('clientId',        'name')
        .populate('projectManager',  'fullName email')
        .populate('projectEngineer', 'fullName')
        .populate('siteEngineer',    'fullName')
        .populate('siteSupervisor',  'fullName')
        .sort({ createdAt: -1 });

        // Attach task counts per project
        const projectIds = projects.map(p => p._id);
        const tasks = await ProductionTask.find({ projectId: { $in: projectIds } });

        const taskCountMap = {};
        tasks.forEach(t => {
            const pid = t.projectId.toString();
            taskCountMap[pid] = (taskCountMap[pid] || 0) + 1;
        });

        const result = projects.map(p => ({
            ...p.toObject(),
            taskCount: taskCountMap[p._id.toString()] || 0
        }));

        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Engineer dashboard stats
exports.getEngineerDashboard = async (req, res) => {
    try {
        const uid = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const tasks = await ProductionTask.find({ assignedTo: uid })
            .populate('projectId', 'projectName')
            .populate('assignedBy', 'fullName')
            .sort({ createdAt: -1 });

        const pending    = tasks.filter(t => t.status === 'Pending').length;
        const inProgress = tasks.filter(t => t.status === 'In Progress').length;
        const completed  = tasks.filter(t => t.status === 'Completed').length;
        const approved   = tasks.filter(t => t.status === 'Approved').length;
        const overdue    = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && !['Completed','Approved'].includes(t.status));
        const dueToday   = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow);
        const highPriority = tasks.filter(t => ['High','Urgent'].includes(t.priority) && !['Completed','Approved'].includes(t.status));
        const recent     = tasks.slice(0, 5);

        res.status(200).json({
            success: true,
            data: {
                stats: { total: tasks.length, pending, inProgress, completed, approved },
                overdue,
                dueToday,
                highPriority,
                recentTasks: recent
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get engineer's tasks (filtered)
exports.getEngineerTasks = async (req, res) => {
    try {
        const uid = req.user.id;
        const { status, priority, stage, projectId } = req.query;

        const query = { assignedTo: uid };
        if (status)    query.status   = status;
        if (priority)  query.priority = priority;
        if (stage)     query.stage    = stage;
        if (projectId) query.projectId = projectId;

        const tasks = await ProductionTask.find(query)
            .populate('projectId',  'projectName')
            .populate('assignedBy', 'fullName role')
            .populate('assignedTo', 'fullName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single task detail
exports.getTaskById = async (req, res) => {
    try {
        const task = await ProductionTask.findById(req.params.taskId)
            .populate('projectId',  'projectName status progress startDate endDate')
            .populate('assignedBy', 'fullName role')
            .populate('assignedTo', 'fullName role')
            .populate('parentTask', 'title status')
            .populate('comments.postedBy', 'fullName role')
            .populate('updates.updatedBy', 'fullName');

        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        // Also fetch subtasks
        const subtasks = await ProductionTask.find({ parentTask: task._id })
            .populate('assignedTo', 'fullName role');

        res.status(200).json({ success: true, data: { ...task.toObject(), subtasks } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add a comment to a task
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ success: false, message: 'Comment text is required' });

        const task = await ProductionTask.findById(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

        task.comments.push({ text, postedBy: req.user.id });
        await task.save();

        await logActivity(task.projectId, req.user.id, 'ADD_COMMENT', `Comment added to task "${task.title}".`);

        const updated = await ProductionTask.findById(task._id).populate('comments.postedBy', 'fullName role');
        res.status(200).json({ success: true, data: updated.comments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// PE creates a subtask (assigns to SE/SS)
exports.createSubtask = async (req, res) => {
    try {
        const { title, description, projectId, assignedTo, priority, dueDate, parentTaskId } = req.body;

        if (!parentTaskId) return res.status(400).json({ success: false, message: 'parentTaskId is required' });

        const parentTask = await ProductionTask.findById(parentTaskId);
        if (!parentTask) return res.status(404).json({ success: false, message: 'Parent task not found' });

        // Determine stage based on assigned user role
        const User = require('../models/User');
        const assignee = await User.findById(assignedTo);
        const stageMap = { 'Site Engineer': 'SE', 'Site Supervisor': 'SS', 'Project Engineer': 'PE' };
        const stage = stageMap[assignee?.role] || 'SE';

        const subtask = await ProductionTask.create({
            title,
            description,
            projectId: projectId || parentTask.projectId,
            assignedBy: req.user.id,
            assignedTo,
            stage,
            priority: priority || 'Medium',
            dueDate,
            parentTask: parentTaskId,
            isSubtask: true
        });

        await logActivity(subtask.projectId, req.user.id, 'CREATE_SUBTASK', `Subtask "${title}" created under "${parentTask.title}".`);

        res.status(201).json({ success: true, data: subtask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get activity log for a project
exports.getProjectActivity = async (req, res) => {
    try {
        const uid = req.user.id;
        const projectId = req.params.id;

        // Verify access
        const project = await ProductionProject.findById(projectId);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

        const ids = [project.projectManager, project.projectEngineer, project.siteEngineer, project.siteSupervisor]
            .map(i => i?.toString());
        if (!ids.includes(uid) && req.user.role !== 'Admin' && req.user.role !== 'Super Admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const logs = await ProductionActivityLog.find({ projectId })
            .populate('userId', 'fullName role')
            .sort({ timestamp: -1 })
            .limit(50);

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get site engineers / supervisors for dropdown (PE assigning subtasks)
exports.getSiteTeam = async (req, res) => {
    try {
        const User = require('../models/User');
        const members = await User.find({
            role: { $in: ['Site Engineer', 'Site Supervisor'] }
        }).select('fullName email role');
        res.status(200).json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
