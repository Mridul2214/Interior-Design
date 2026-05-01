const mongoose = require('mongoose');

const SiteVisitSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    location: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    visitDate: {
        type: Date,
        default: Date.now
    },
    images: [{
        type: String // URLs
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('SiteVisit', SiteVisitSchema);
