const mongoose = require('mongoose');

const POItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit: {
        type: String,
        required: true,
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
    receivedQuantity: {
        type: Number,
        default: 0,
        min: 0
    }
});

const PurchaseOrderSchema = new mongoose.Schema({
    poNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    supplier: {
        type: String,
        required: [true, 'Please provide supplier name'],
        trim: true
    },
    supplierContact: {
        type: String,
        trim: true
    },
    supplierEmail: {
        type: String,
        trim: true,
        lowercase: true
    },
    orderDate: {
        type: Date,
        required: [true, 'Please provide order date'],
        default: Date.now
    },
    expectedDeliveryDate: {
        type: Date,
        required: [true, 'Please provide expected delivery date']
    },
    actualDeliveryDate: {
        type: Date
    },
    deliveryAddress: {
        type: String,
        required: [true, 'Please provide delivery address'],
        trim: true
    },
    paymentTerms: {
        type: String,
        trim: true,
        default: 'Net 30 days'
    },
    items: [POItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 18,
        min: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending', 'Approved', 'Ordered', 'Partially Received', 'Received', 'Cancelled'],
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
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Auto-generate PO number
PurchaseOrderSchema.pre('save', async function (next) {
    if (!this.poNumber) {
        const count = await mongoose.model('PurchaseOrder').countDocuments();
        const year = new Date().getFullYear();
        this.poNumber = `PO-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Calculate totals
PurchaseOrderSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    this.totalAmount = this.subtotal + this.taxAmount;
    next();
});

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
