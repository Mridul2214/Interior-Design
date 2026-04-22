const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProductionTasks, createProductionTask, updateProductionTask, getProjectPipeline, getProductionStats, reportIssue } = require('../controllers/productionController');

router.use(protect);

router.route('/tasks')
    .get(getProductionTasks)
    .post(createProductionTask);

router.route('/tasks/:id')
    .put(updateProductionTask);

router.route('/tasks/:taskId/report-issue')
    .post(reportIssue);

router.route('/pipeline')
    .get(getProjectPipeline);

router.route('/stats')
    .get(getProductionStats);

module.exports = router;
