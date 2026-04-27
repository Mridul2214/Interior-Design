const mongoose = require('mongoose');

const ProductionTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a task title'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionProject',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    stage: {
        type: String,
        enum: ['PM', 'PE', 'SE', 'SS'], // Project Manager, Project Engineer, Site Engineer, Site Supervisor
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    updates: [{
        log: String,
        images: [String],
        note: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        text: { type: String, required: true },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    dueDate: {
        type: Date
    },
    parentTask: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionTask',
        default: null
    },
    isSubtask: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductionTask', ProductionTaskSchema);
