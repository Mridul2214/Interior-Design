const mongoose = require('mongoose');

const siteProgressReportSchema = new mongoose.Schema({
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
    workStatus: { 
        type: String, 
        enum: ['On Track', 'Delayed', 'Blocked', 'Completed'], 
        default: 'On Track' 
    },
    weather: { 
        type: String, 
        enum: ['Clear', 'Cloudy', 'Rainy', 'Windy'],
        default: 'Clear'
    },
    workDone: { 
        type: String, 
        required: true 
    },
    workersPresent: { 
        type: Number 
    },
    issues: { 
        type: String 
    },
    nextDayPlan: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('SiteProgressReport', siteProgressReportSchema);
