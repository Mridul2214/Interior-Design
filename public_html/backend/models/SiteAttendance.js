const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
    workerName: { type: String, required: true },
    role: { type: String, required: true }, // e.g., 'Carpenter', 'Electrician', 'Laborer'
    status: { 
        type: String, 
        enum: ['Present', 'Absent', 'Half-Day'], 
        default: 'Present' 
    },
    checkInTime: { type: String },
    checkOutTime: { type: String },
    notes: { type: String }
});

const siteAttendanceSchema = new mongoose.Schema({
    project: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ProductionProject', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    submittedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    records: [attendanceRecordSchema]
}, { timestamps: true });

// Ensure one attendance sheet per project per day
siteAttendanceSchema.index({ project: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('SiteAttendance', siteAttendanceSchema);
