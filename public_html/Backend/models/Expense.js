const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    expenseNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Please link a project']
    },
    type: {
        type: String,
        enum: ['Material', 'Labor', 'Transport', 'Equipment', 'Permit', 'Consultation', 'Miscellaneous'],
        required: [true, 'Please specify expense type']
    },
    category: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide description'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Please provide amount'],
        min: 0
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    purchaseOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseOrder'
    },
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    expenseDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Partially Paid'],
        default: 'Pending'
    },
    paidAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    paymentDate: {
        type: Date
    },
    receipt: {
        type: String
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

ExpenseSchema.pre('save', async function (next) {
    if (!this.expenseNumber) {
        const count = await mongoose.model('Expense').countDocuments();
        const year = new Date().getFullYear();
        this.expenseNumber = `EXP-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

ExpenseSchema.index({ project: 1, type: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
