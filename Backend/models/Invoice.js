const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    rate: {
        type: Number,
        required: true,
        min: 0
    },
    tax: {
        type: Number,
        default: 18,
        min: 0,
        max: 100
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
});

const InvoiceSchema = new mongoose.Schema({
    invoiceNumber: {
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
    quotation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation'
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    invoiceDate: {
        type: Date,
        required: [true, 'Please provide invoice date'],
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: [true, 'Please provide due date']
    },
    items: [InvoiceItemSchema],
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    totalTax: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number,
        required: true,
        default: 0
    },
    amountPaid: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Partially Paid', 'Cancelled'],
        default: 'Draft'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card', 'Other'],
        default: null
    },
    paymentDate: {
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
    }
}, {
    timestamps: true
});

// Auto-generate invoice number
InvoiceSchema.pre('validate', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose.model('Invoice').countDocuments();
        const year = new Date().getFullYear();
        this.invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, '0')}`;
    }
    next();
});

// Calculate totals
InvoiceSchema.pre('save', function (next) {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    this.totalTax = this.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.rate;
        return sum + (itemTotal * item.tax / 100);
    }, 0);
    this.grandTotal = this.subtotal + this.totalTax;

    // Update status based on payment
    if (this.amountPaid >= this.grandTotal) {
        this.status = 'Paid';
    } else if (this.amountPaid > 0) {
        this.status = 'Partially Paid';
    } else if (this.dueDate < new Date() && this.status !== 'Paid') {
        this.status = 'Overdue';
    }

    next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
