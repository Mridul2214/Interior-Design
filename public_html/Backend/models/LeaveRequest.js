const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['Sick Leave', 'Casual Leave', 'Emergency Leave', 'Annual Leave', 'Work From Home']
    },
    fromDate: {
        type: Date,
        required: true
    },
    toDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Approved', 'Rejected']
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    managerComments: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
