const express = require('express');
const router = express.Router();

const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/kanbanTaskController');

router.route('/')
    .get(getTasks)
    .post(createTask);

router.route('/:id')
    .patch(updateTask)
    .delete(deleteTask);

module.exports = router;
