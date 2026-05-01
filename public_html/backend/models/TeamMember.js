const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Please provide a role'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number']
    },
    location: {
        type: String,
        required: [true, 'Please provide a location']
    },
    reportingManager: {
        type: [String],
        default: []
    },
    activeProjects: {
        type: Number,
        default: 0
    },
    workloadPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    performance: {
        type: String,
        enum: ['Excellent', 'Good', 'Outstanding'],
        default: 'Good'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TeamMember', TeamMemberSchema);
