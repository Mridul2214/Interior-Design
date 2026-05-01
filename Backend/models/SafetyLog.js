const mongoose = require('mongoose');

const safetyLogSchema = new mongoose.Schema({
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProductionProject', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    reportedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['Incident', 'Hazard', 'Daily Check'], 
        required: true 
    },
    severity: { 
        type: String, 
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    description: { 
        type: String, 
        required: true 
    },
    actionTaken: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['Open', 'Resolved'], 
        default: 'Open' 
    },
    attachments: [{ 
        type: String // URLs or file paths
    }]
}, { timestamps: true });

module.exports = mongoose.model('SafetyLog', safetyLogSchema);
