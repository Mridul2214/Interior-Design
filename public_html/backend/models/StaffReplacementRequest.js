const mongoose = require('mongoose');

const StaffReplacementRequestSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductionProject',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    staffType: {
        type: String,
        enum: ['Site Engineer', 'Site Supervisor'],
        required: true
    },
    currentStaffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for replacement'],
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminRemarks: {
        type: String,
        trim: true
    },
    actionedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actionedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('StaffReplacementRequest', StaffReplacementRequestSchema);
