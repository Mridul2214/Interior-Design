const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    projectNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Please select a client']
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        required: [true, 'Please link a quotation']
    },
    name: {
        type: String,
        required: [true, 'Please provide project name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    stage: {
        type: String,
        enum: ['Design', 'Procurement', 'Production', 'Completed'],
        default: 'Design'
    },
    status: {
        type: String,
        enum: ['Not Started', 'In Progress', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Not Started'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    budget: {
        type: Number,
        default: 0,
        min: 0
    },
    spent: {
        type: Number,
        default: 0,
        min: 0
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    targetEndDate: {
        type: Date
    },
    actualEndDate: {
        type: Date
    },
    assignedDesignManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedProcurementManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedProductionManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        trim: true
    },
    designComplete: {
        type: Boolean,
        default: false
    },
    materialsReady: {
        type: Boolean,
        default: false
    },
    productionComplete: {
        type: Boolean,
        default: false
    },
    handoverComplete: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

ProjectSchema.pre('validate', async function (next) {
    if (!this.projectNumber) {
        const count = await mongoose.model('Project').countDocuments();
        const year = new Date().getFullYear();
        this.projectNumber = `PRJ-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

ProjectSchema.pre('save', function (next) {
    let completedCount = 0;
    if (this.designComplete) completedCount++;
    if (this.materialsReady) completedCount++;
    if (this.productionComplete) completedCount++;
    if (this.handoverComplete) completedCount++;
    
    this.progress = Math.round((completedCount / 4) * 100);
    
    if (this.handoverComplete) {
        this.stage = 'Completed';
        this.status = 'Completed';
        if (!this.actualEndDate) {
            this.actualEndDate = new Date();
        }
    } else if (this.productionComplete) {
        this.stage = 'Production';
    } else if (this.materialsReady) {
        this.stage = 'Procurement';
    } else {
        this.stage = 'Design';
    }
    
    next();
});

ProjectSchema.index({ name: 'text', projectNumber: 'text' });
ProjectSchema.index({ client: 1, stage: 1, status: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
