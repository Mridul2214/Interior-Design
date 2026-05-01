const mongoose = require('mongoose');

const ApprovalSchema = new mongoose.Schema({
    requestTitle: {
        type: String,
        required: [true, 'Please provide a request title'],
        trim: true
    },
    projectName: {
        type: String,
        required: [true, 'Please provide a project name'],
        trim: true
    },
    submittedBy: {
        type: String,
        required: [true, 'Please provide the submitter name'],
        trim: true
    },
    requestType: {
        type: String,
        enum: ['Material', 'Milestone', 'Vendor', 'Design'],
        required: [true, 'Please provide a request type']
    },
    value: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Approval', ApprovalSchema);
