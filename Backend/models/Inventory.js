const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Please provide item name'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        required: [true, 'Please select a section'],
        trim: true
    },
    finish: {
        type: String,
        trim: true
    },
    material: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        enum: ['SCM', 'sheets', 'sqft', 'pieces', 'meters', 'liters', 'kg'],
        default: 'SCM'
    },
    size: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: 0
    },
    offerPrice: {
        type: Number,
        min: 0
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    reorderLevel: {
        type: Number,
        default: 10,
        min: 0
    },
    image: {
        type: String,
        default: null
    },
    catalog: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Out of Stock'],
        default: 'In Stock'
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
InventorySchema.pre('save', function (next) {
    if (this.stock === 0) {
        this.status = 'Out of Stock';
    } else if (this.stock <= this.reorderLevel) {
        this.status = 'Low Stock';
    } else {
        this.status = 'In Stock';
    }
    next();
});

// Index for faster searches
InventorySchema.index({ itemName: 'text', description: 'text', section: 'text' });

module.exports = mongoose.model('Inventory', InventorySchema);
