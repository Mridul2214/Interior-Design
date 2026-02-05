const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide notification title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide notification description'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Info', 'Success', 'Warning', 'Error', 'Quote', 'Invoice', 'Task', 'Inventory', 'PO'],
        default: 'Info'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedModel: {
        type: String,
        enum: ['Quotation', 'Invoice', 'Task', 'PurchaseOrder', 'Inventory', 'Client', null],
        default: null
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Mark as read
NotificationSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

// Index for faster queries
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
