const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide task title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Completed', 'Blocked'],
        default: 'To Do'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: [true, 'Please assign this task to at least one staff member']
    }],
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    dueDate: {
        type: Date,
        required: [true, 'Please provide a due date']
    },
    estimatedDuration: {
        type: String,
        trim: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    project: {
        type: String,
        trim: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    estimatedHours: {
        type: Number,
        default: 0,
        min: 0
    },
    actualHours: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    notes: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        default: null
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    submissions: [{
        files: [{
            filename: String,
            url: String,
            fileType: String, // 2D, 3D, etc.
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        staffNotes: String,
        managerFeedback: String,
        status: {
            type: String,
            enum: ['Pending Review', 'Approved', 'Revision Required'],
            default: 'Pending Review'
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        reviewedAt: Date,
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Review Pending', 'Revision Required', 'Completed', 'Approved', 'Rejected', 'Pushed to Procurement', 'Blocked'],
        default: 'To Do'
    },
    completedAt: {
        type: Date
    },
    isOnTime: {
        type: Boolean,
        default: null
    },
    isOverdue: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date
        }
    }],
    timeline: [{
        action: {
            type: String,
            enum: ['created', 'started', 'reassigned', 'completed', 'reopened', 'updated', 'commented', 'submitted', 'revisionRequested', 'approved', 'pushed'],
            required: true
        },
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        details: {
            type: String,
            trim: true
        },
        oldValue: {
            type: mongoose.Schema.Types.Mixed
        },
        newValue: {
            type: mongoose.Schema.Types.Mixed
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastStatusUpdate: {
        type: Date,
        default: null
    },
    dailyUpdates: [{
        staff: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Staff'
        },
        update: {
            type: String,
            required: true
        },
        emergencies: {
            type: String,
            trim: true
        },
        extensionRequest: {
            requestedDate: Date,
            reason: String,
            status: {
                type: String,
                enum: ['Pending', 'Approved', 'Rejected'],
                default: 'Pending'
            }
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Auto-update completedAt and progress when status changes
TaskSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        const now = new Date();
        
        if (this.status === 'Completed' || this.status === 'Approved' || this.status === 'Pushed to Procurement') {
            if (!this.completedAt) this.completedAt = now;
            this.progress = 100;
            this.isOverdue = false;
        } else if (this.status === 'Review Pending') {
            this.progress = 100;
        } else if (this.status === 'Revision Required') {
            this.progress = 50; // Indicates feedback loop
        } else if (this.status === 'In Progress' && this.progress === 0) {
            this.progress = 10; // Started
        }

        if (this.completedAt && this.dueDate) {
            this.isOnTime = this.completedAt <= this.dueDate;
        }
    }

    // Overdue detection
    if (this.status !== 'Completed' && this.status !== 'Approved' && this.status !== 'Pushed to Procurement') {
        if (this.dueDate && new Date(this.dueDate) < new Date()) {
            this.isOverdue = true;
        } else {
            this.isOverdue = false;
        }
    } else {
        this.isOverdue = false;
    }

    next();
});

// Index for faster searches
TaskSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
