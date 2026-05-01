const mongoose = require('mongoose');

const POInventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Please provide item name'],
        trim: true
    },
    sku: {
        type: String,
        trim: true,
        uppercase: true
    },
    supplier: {
        type: String,
        required: [true, 'Please provide supplier name'],
        trim: true
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    currentStock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'Sheets'
    },
    reorderPoint: {
        type: Number,
        required: true,
        default: 20,
        min: 0
    },
    lastReceived: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
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

// Update status based on stock level
POInventorySchema.pre('save', function (next) {
    if (this.currentStock === 0) {
        this.status = 'Out of Stock';
    } else if (this.currentStock <= this.reorderPoint) {
        this.status = 'Low Stock';
    } else {
        this.status = 'In Stock';
    }
    next();
});

// Index for faster searches
POInventorySchema.index({ itemName: 'text', sku: 'text', supplier: 'text' });

module.exports = mongoose.model('POInventory', POInventorySchema);
