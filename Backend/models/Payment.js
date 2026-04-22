const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    paymentNumber: {
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
    invoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice',
        required: [true, 'Please link an invoice']
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Please link a client']
    },
    amount: {
        type: Number,
        required: [true, 'Please provide payment amount'],
        min: 0
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Card', 'RTGS', 'NEFT', 'Other'],
        required: [true, 'Please specify payment method']
    },
    transactionId: {
        type: String,
        trim: true
    },
    reference: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    },
    receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

PaymentSchema.pre('save', async function (next) {
    if (!this.paymentNumber) {
        const count = await mongoose.model('Payment').countDocuments();
        const year = new Date().getFullYear();
        this.paymentNumber = `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

PaymentSchema.index({ project: 1, invoice: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
