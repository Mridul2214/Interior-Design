const mongoose = require('mongoose');

const MaterialRequestItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        default: 'pieces'
    },
    specifications: {
        type: String,
        trim: true
    },
    isExtra: {
        type: Boolean,
        default: false
    },
    reasonForExtra: {
        type: String,
        trim: true
    },
    requiredByDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Quoted', 'Ordered', 'Received'],
        default: 'Pending'
    }
});

const TimeExtensionSchema = new mongoose.Schema({
    requestedDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    managerRemarks: {
        type: String,
        trim: true
    }
});

const MaterialRequestSchema = new mongoose.Schema({
    requestNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    items: [MaterialRequestItemSchema],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Design Review', 'Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled', 'Assigned', 'Purchasing', 'Pending Manager Review', 'Pending Admin Review', 'Procurement Approved'],
        default: 'Pending'
    },
    managerRemarks: {
        type: String,
        trim: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    completedAt: {
        type: Date
    },
    timeExtension: TimeExtensionSchema,
    staffRemarks: {
        type: String,
        trim: true
    },
    staffUpdateNotes: {
        type: String,
        trim: true
    },
    isPushedFromDesign: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBudget: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

MaterialRequestSchema.pre('save', async function (next) {
    if (!this.requestNumber) {
        const count = await mongoose.model('MaterialRequest').countDocuments();
        const year = new Date().getFullYear();
        this.requestNumber = `MR-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

MaterialRequestSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('MaterialRequest', MaterialRequestSchema);
