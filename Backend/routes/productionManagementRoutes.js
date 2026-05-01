const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
    getUpcomingDeadlines,
    getBudgetOverview,
    // Engineer APIs
    getMyProjects,
    getEngineerDashboard,
    getEngineerTasks,
    getTaskById,
    addComment,
    createSubtask,
    getProjectActivity,
    getSiteTeam,
    getHandoffProjects,
    getProductionStaff,
    acceptHandoff,
    createReplacementRequest,
    getReplacementRequests,
    actionReplacementRequest,
    // PM Analytics
    getDashboardCharts,
    getBudgetAnalytics,
    getKPIMetrics,
    getGanttData,
    // Phase 6
    getProductionReports
} = require('../controllers/productionManagementController');

const {
    submitAttendance,
    getProjectAttendance,
    reportSafetyIssue,
    getProjectSafetyLogs,
    updateSafetyLogStatus,
    submitDailyReport,
    getProjectReports,
    submitSupervisorReport,
    getSupervisorReports
} = require('../controllers/siteManagementController');

// All routes require authentication
router.use(protect);

// =======================
// PROJECT APIs
// =======================
router.post('/projects/create', createProject);
router.get('/projects', getProjects);
router.get('/projects/handoff', authorize('Project Manager', 'Admin', 'Super Admin'), getHandoffProjects);
router.get('/projects/staff', authorize('Project Manager', 'Admin', 'Super Admin'), getProductionStaff);
router.put('/projects/:id/accept-handoff', isProjectManager, acceptHandoff);
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
router.get('/dashboard/deadlines', getUpcomingDeadlines);
router.get('/dashboard/budget', getBudgetOverview);
router.get('/dashboard/charts', getDashboardCharts);
router.get('/dashboard/budget-analytics', getBudgetAnalytics);
router.get('/dashboard/kpi', getKPIMetrics);
router.get('/gantt/:projectId', getGanttData);

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

// =======================
// STAFF REPLACEMENT
// =======================
router.post('/projects/:projectId/replacement-request', authorize('Project Engineer'), createReplacementRequest);
router.get('/staff-replacement/requests', authorize('Project Manager', 'Admin', 'Super Admin'), getReplacementRequests);
router.put('/staff-replacement/requests/:requestId/action', authorize('Project Manager', 'Admin', 'Super Admin'), actionReplacementRequest);

// =======================
// SITE MANAGEMENT (SE/SS)
// =======================
router.post('/site/attendance', authorize('Site Engineer', 'Site Supervisor', 'Project Manager', 'Project Engineer'), submitAttendance);
router.get('/site/attendance/:projectId', getProjectAttendance);

router.post('/site/safety', authorize('Site Engineer', 'Site Supervisor', 'Project Manager', 'Project Engineer'), reportSafetyIssue);
router.get('/site/safety/:projectId', getProjectSafetyLogs);
router.patch('/site/safety/:logId', authorize('Site Engineer', 'Site Supervisor', 'Project Manager', 'Project Engineer'), updateSafetyLogStatus);

router.post('/site/reports', authorize('Site Engineer', 'Site Supervisor', 'Project Manager', 'Project Engineer'), submitDailyReport);
router.get('/site/reports/:projectId', getProjectReports);

router.post('/site/supervisor-reports', authorize('Site Supervisor', 'Project Manager', 'Project Engineer'), submitSupervisorReport);
router.get('/site/supervisor-reports/:projectId', getSupervisorReports);

router.get('/reports', authorize('Project Manager', 'Admin'), getProductionReports);

module.exports = router;
