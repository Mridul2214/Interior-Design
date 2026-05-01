const mongoose = require('mongoose');

const VendorPurchaseItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        default: 'pieces'
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    discountPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    finalAmount: {
        type: Number,
        required: true,
        min: 0
    }
});

const VendorPurchaseSchema = new mongoose.Schema({
    purchaseNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    materialRequest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MaterialRequest'
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    items: [VendorPurchaseItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    totalDiscount: {
        type: Number,
        default: 0,
        min: 0
    },
    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Ordered', 'Received', 'Cancelled'],
        default: 'Ordered'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    deliveryLocation: {
        type: String,
        trim: true
    },
    purchasedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    vendorLocation: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

VendorPurchaseSchema.pre('save', async function (next) {
    if (!this.purchaseNumber) {
        const count = await mongoose.model('VendorPurchase').countDocuments();
        const year = new Date().getFullYear();
        this.purchaseNumber = `VP-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

VendorPurchaseSchema.index({ vendor: 1, purchaseDate: -1 });
VendorPurchaseSchema.index({ 'items.itemName': 1 });
VendorPurchaseSchema.index({ project: 1 });

module.exports = mongoose.model('VendorPurchase', VendorPurchaseSchema);