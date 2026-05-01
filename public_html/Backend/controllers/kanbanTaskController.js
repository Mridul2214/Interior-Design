const KanbanTask = require('../models/KanbanTask');

exports.getTasks = async (req, res) => {
    try {
        const tasks = await KanbanTask.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        // Generate a random taskId if not provided
        let { taskId, ...rest } = req.body;
        if (!taskId) {
            taskId = 'T-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        }
        const task = await KanbanTask.create({ taskId, ...rest });
        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const task = await KanbanTask.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const task = await KanbanTask.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
