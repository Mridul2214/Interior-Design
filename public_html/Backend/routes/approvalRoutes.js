const express = require('express');
const router = express.Router();

const {
    getApprovals,
    createApproval,
    updateApproval,
    deleteApproval
} = require('../controllers/approvalController');

router.route('/')
    .get(getApprovals)
    .post(createApproval);

router.route('/:id')
    .patch(updateApproval)
    .delete(deleteApproval);

module.exports = router;
