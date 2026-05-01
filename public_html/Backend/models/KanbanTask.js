const mongoose = require('mongoose');

const KanbanTaskSchema = new mongoose.Schema({
    taskId: {
        type: String,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true
    },
    projectName: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true
    },
    assignedTo: {
        type: String,
        trim: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo'
    },
    dueDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('KanbanTask', KanbanTaskSchema);
