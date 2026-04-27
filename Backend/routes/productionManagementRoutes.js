const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isProjectManager, isAssignedUser } = require('../middleware/productionAuth');

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    assignTeam,
    createTask,
    assignTask,
    updateTaskStatus,
    getTasksByProject,
    approveTask,
    getDashboardOverview,
    getPendingApprovals,
    getAllTasks,
    getTeamOverview,
    // Engineer APIs
    getMyProjects,
    getEngineerDashboard,
    getEngineerTasks,
    getTaskById,
    addComment,
    createSubtask,
    getProjectActivity,
    getSiteTeam
} = require('../controllers/productionManagementController');

// All routes require authentication
router.use(protect);

// =======================
// PROJECT APIs
// =======================
router.post('/projects/create', createProject);
router.get('/projects', getProjects);
router.get('/projects/:id', isAssignedUser, getProjectById);
router.put('/projects/:id/update', isProjectManager, updateProject);
router.put('/projects/:id/assign-team', isProjectManager, assignTeam);

// =======================
// TASK APIs
// =======================
router.post('/tasks/create', isProjectManager, createTask);
router.put('/tasks/:taskId/assign', isProjectManager, assignTask);
router.put('/tasks/:taskId/update-status', isAssignedUser, updateTaskStatus);
router.get('/tasks/project/:id', isAssignedUser, getTasksByProject);
router.get('/tasks/all', getAllTasks);
router.get('/tasks/:taskId', getTaskById);
router.post('/tasks/:taskId/comment', addComment);

// =======================
// CONTROL APIs (PM Only)
// =======================
router.put('/tasks/:taskId/approve', isProjectManager, approveTask);
router.get('/approvals/pending', getPendingApprovals);
router.get('/dashboard/overview', getDashboardOverview);

// =======================
// TEAM
// =======================
router.get('/team/all', getTeamOverview);
router.get('/team/site', getSiteTeam);

// =======================
// ENGINEER APIs
// =======================
router.get('/engineer/dashboard', getEngineerDashboard);
router.get('/engineer/projects',  getMyProjects);
router.get('/engineer/tasks',     getEngineerTasks);
router.post('/engineer/subtask',  createSubtask);
router.get('/projects/:id/activity', getProjectActivity);

module.exports = router;
