const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    updateProjectStage,
    getProjectStats,
    getProjectsByStage,
    validateHandoff,
    performHandoff,
    getWorkflowChecklist
} = require('../controllers/projectController');

router.use(protect);

router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/stats')
    .get(getProjectStats);

router.route('/stage/:stage')
    .get(getProjectsByStage);

router.route('/:id')
    .get(getProject)
    .put(updateProject);

router.route('/:id/stage')
    .put(updateProjectStage);

router.route('/:id/handoff/validate')
    .get(validateHandoff);

router.route('/:id/handoff')
    .post(performHandoff);

router.route('/:id/workflow-checklist')
    .get(getWorkflowChecklist);

module.exports = router;
