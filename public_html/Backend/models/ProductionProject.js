const mongoose = require('mongoose');

const ProductionProjectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: false // Optional if not linked to existing client
    },
    projectType: {
        type: String,
        enum: ['Residential', 'Commercial', 'Corporate', 'Other'],
        default: 'Residential'
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed'],
        default: 'Planning'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    projectManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A Project Manager must be assigned']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    siteEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    siteSupervisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    sourceProject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    budget: {
        type: Number,
        default: 0
    },
    spent: {
        type: Number,
        default: 0
    },
    estimatedCost: {
        type: Number,
        default: 0
    },
    riskLevel: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    location: {
        type: String,
        trim: true
    },
    siteAddress: {
        type: String,
        trim: true
    },
    milestones: [{
        title: { type: String, required: true },
        dueDate: Date,
        completed: { type: Boolean, default: false },
        completedAt: Date
    }],
    attachments: [{
        name: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductionProject', ProductionProjectSchema);
