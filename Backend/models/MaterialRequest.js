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
    requiredByDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Quoted', 'Ordered', 'Received'],
        default: 'Pending'
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
        enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
