const mongoose = require('mongoose');

const QuotationItemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    section: {
        type: String,
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
        default: 'SCM'
    },
    size: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
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
    image: {
        type: String,
        default: null
    }
});

const QuotationSchema = new mongoose.Schema({
    quotationNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Please select a client']
    },
    projectName: {
        type: String,
        required: [true, 'Please provide project name'],
        trim: true
    },
    projectType: {
        type: String,
        enum: ['Residential', 'Commercial', 'Hospitality', 'Retail', 'Other'],
        default: 'Residential'
    },
    items: [QuotationItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    taxRate: {
        type: Number,
        default: 18,
        min: 0,
        max: 100
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Pending', 'Approved', 'Rejected', 'Expired'],
        default: 'Draft'
    },
    validUntil: {
        type: Date
    },
    notes: {
        type: String,
        trim: true
    },
    termsAndConditions: {
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

// Auto-generate quotation number
QuotationSchema.pre('save', async function (next) {
    if (!this.quotationNumber) {
        const count = await mongoose.model('Quotation').countDocuments();
        const year = new Date().getFullYear();
        this.quotationNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Calculate totals before saving
QuotationSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
    this.taxAmount = (this.subtotal * this.taxRate) / 100;
    this.totalAmount = this.subtotal + this.taxAmount - this.discount;
    next();
});

module.exports = mongoose.model('Quotation', QuotationSchema);
