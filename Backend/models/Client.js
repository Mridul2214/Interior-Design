const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide client name'],
        trim: true,
        maxlength: [200, 'Name cannot be more than 200 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide client email'],
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    siteAddress: {
        type: String,
        trim: true
    },
    billingAddress: {
        type: String,
        trim: true
    },
    billingPincode: {
        type: String,
        trim: true
    },
    contact1: {
        type: String,
        trim: true
    },
    contact2: {
        type: String,
        trim: true
    },
    clientGST: {
        type: String,
        trim: true,
        uppercase: true
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true
    },
    clientManager: {
        type: String,
        trim: true
    },
    clientManagerContact: {
        type: String,
        trim: true
    },
    clientManagerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    interiorDesigner: {
        type: String,
        trim: true
    },
    interiorDesignerContact: {
        type: String,
        trim: true
    },
    interiorDesignerEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    customerServiceContact: {
        type: String,
        trim: true
    },
    customerServiceEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Archived'],
        default: 'Active'
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for faster searches
ClientSchema.index({ name: 'text', email: 'text', clientGST: 'text' });

module.exports = mongoose.model('Client', ClientSchema);
