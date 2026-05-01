const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    staffId: {
        type: String,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        trim: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    role: {
        type: String,
        required: [true, 'Please provide a role'],
        trim: true,
        minlength: [2, 'Role must be at least 2 characters']
    },
    joiningDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-generate staffId before saving (e.g., STF-0001)
StaffSchema.pre('save', async function (next) {
    if (!this.staffId) {
        const lastStaff = await mongoose.model('Staff')
            .findOne({}, {}, { sort: { createdAt: -1 } });

        let nextNum = 1;
        if (lastStaff && lastStaff.staffId) {
            const match = lastStaff.staffId.match(/STF-(\d+)/);
            if (match) nextNum = parseInt(match[1]) + 1;
        }
        this.staffId = `STF-${String(nextNum).padStart(4, '0')}`;
    }
    next();
});

// Index for easier searching
StaffSchema.index({ name: 'text', role: 'text', phone: 'text', staffId: 'text' });

module.exports = mongoose.model('Staff', StaffSchema);
