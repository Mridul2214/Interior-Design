const mongoose = require('mongoose');

const ChecklistStepSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    startedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    images: [{
        url: String,
        caption: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const ChecklistSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please link a project']
    },
    steps: [ChecklistStepSchema],
    overallStatus: {
        type: String,
        enum: ['Not Started', 'In Progress', 'Completed'],
        default: 'Not Started'
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

ChecklistSchema.pre('save', function (next) {
    if (this.steps && this.steps.length > 0) {
        const completedSteps = this.steps.filter(s => s.status === 'Completed').length;
        this.progress = Math.round((completedSteps / this.steps.length) * 100);
        
        if (completedSteps === this.steps.length) {
            this.overallStatus = 'Completed';
        } else if (completedSteps > 0) {
            this.overallStatus = 'In Progress';
        } else {
            this.overallStatus = 'Not Started';
        }
    }
    next();
});

module.exports = mongoose.model('Checklist', ChecklistSchema);
