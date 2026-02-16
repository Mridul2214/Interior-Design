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
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',  // Changed from 'User' to 'Staff'
        required: [true, 'Please assign this task to a staff member']
    },
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
        trim: true  // e.g., "5 days", "2 weeks"
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
    completedAt: {
        type: Date
    },
    isOnTime: {
        type: Boolean,
        default: null  // null = not completed yet, true = completed on time, false = completed late
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-update completedAt when status changes to Completed
TaskSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'Completed' && !this.completedAt) {
        this.completedAt = new Date();
        this.progress = 100;

        // Check if completed on time
        if (this.dueDate) {
            this.isOnTime = this.completedAt <= this.dueDate;
        }
    }
    next();
});

// Index for faster searches
TaskSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Task', TaskSchema);
