const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getChecklist, createChecklist, updateChecklistStep, addChecklistStep, deleteChecklistStep } = require('../controllers/checklistController');

router.use(protect);

router.route('/project/:projectId')
    .get(getChecklist)
    .post(createChecklist);

router.route('/project/:projectId/step/:stepId')
    .put(updateChecklistStep)
    .delete(deleteChecklistStep);

router.route('/project/:projectId/step')
    .post(addChecklistStep);

module.exports = router;
