const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Company Profile
    company: {
        companyName: { type: String, default: 'Interior Design', trim: true },
        companyLogo: { type: String, default: null },
        address: { type: String, default: '', trim: true },
        phone: { type: String, default: '', trim: true },
        email: { type: String, default: '', trim: true },
        gstin: { type: String, default: '', trim: true },
        website: { type: String, default: '', trim: true }
    },

    // Document Defaults
    documents: {
        defaultTaxRate: { type: Number, default: 18, min: 0, max: 100 },
        quotationPrefix: { type: String, default: 'QT-', trim: true },
        invoicePrefix: { type: String, default: 'INV-', trim: true },
        quotationValidity: { type: Number, default: 30 },
        defaultTerms: { type: String, default: '', trim: true },
        defaultNotes: { type: String, default: '', trim: true },
        currencySymbol: { type: String, default: '₹', trim: true }
    },

    // Notification Preferences
    notifications: {
        taskDeadlineHours: { type: Number, default: 24 },
        lowStockThreshold: { type: Number, default: 10 },
        quotationExpiryDays: { type: Number, default: 7 },
        emailNotifications: { type: Boolean, default: false }
    },

    // Security
    security: {
        defaultRole: { type: String, default: 'User', enum: ['Super Admin', 'Admin', 'Designer', 'Manager', 'Staff', 'User'] },
        minPasswordLength: { type: Number, default: 6 },
        sessionTimeout: { type: String, default: '30d', trim: true }
    },

    // Application Settings
    application: {
        brandName: { type: String, default: 'Interior Design', trim: true },
        brandSubtitle: { type: String, default: 'Admin Panel', trim: true },
        accentColor: { type: String, default: '#2563eb', trim: true },
        dateFormat: { type: String, default: 'DD/MM/YYYY', enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
        timezone: { type: String, default: 'Asia/Kolkata', trim: true }
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
