const mongoose = require('mongoose');

const VendorQuoteItemSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    items: [{
        itemName: String,
        quantity: Number,
        rate: Number,
        amount: Number
    }],
    totalAmount: {
        type: Number,
        default: 0
    },
    deliveryTime: {
        type: String,
        trim: true
    },
    validUntil: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    selected: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date
    }
});

const VendorComparisonSchema = new mongoose.Schema({
    comparisonNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    materialRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaterialRequest',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    quotes: [VendorQuoteItemSchema],
    selectedVendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    status: {
        type: String,
        enum: ['Draft', 'Comparing', 'Approved', 'PO Created', 'Cancelled'],
        default: 'Draft'
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

VendorComparisonSchema.pre('save', async function (next) {
    if (!this.comparisonNumber) {
        const count = await mongoose.model('VendorComparison').countDocuments();
        const year = new Date().getFullYear();
        this.comparisonNumber = `VC-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

VendorComparisonSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('VendorComparison', VendorComparisonSchema);
