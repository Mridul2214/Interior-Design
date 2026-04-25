const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendorCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide vendor name'],
        trim: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    materialsSupplied: [{ type: String, trim: true }],
    products: [{
        itemName: { type: String, required: true, trim: true },
        unitPrice: { type: Number, required: true, min: 0 },
        unit: { type: String, default: 'pieces', trim: true },
        description: { type: String, trim: true }
    }],
    categories: [{ type: String, trim: true }],
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    paymentTerms: {
        type: String,
        enum: ['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60'],
        default: 'Net 30'
    },
    bankDetails: {
        accountName: String,
        accountNumber: String,
        bankName: String,
        branch: String,
        ifsc: String
    },
    gstin: {
        type: String,
        trim: true
    },
    pan: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Blacklisted'],
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

VendorSchema.pre('save', async function (next) {
    if (!this.vendorCode) {
        const count = await mongoose.model('Vendor').countDocuments();
        this.vendorCode = `VND-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

VendorSchema.index({ name: 'text', email: 'text', materialsSupplied: 'text' });

module.exports = mongoose.model('Vendor', VendorSchema);
