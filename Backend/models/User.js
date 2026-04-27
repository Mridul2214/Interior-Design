const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide a full name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    staffId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be exactly 10 digits'
        }
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        enum: [
            'Super Admin',
            'Admin',
            'Design Manager',
            'Design Staff',
            'Procurement Manager',
            'Procurement Staff',
            'Project Manager',
            'Project Engineer',
            'Site Engineer',
            'Site Supervisor',
            'Accounts Manager',
            'Accounts Staff',
            'Manager',
            'Staff',
            'User'
        ],
        default: 'User'
    },
    department: {
        type: String,
        enum: ['Design', 'Procurement', 'Production', 'Accounts', 'Sales', 'Admin', null],
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    },
    avatar: {
        type: String,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.isManager = function () {
    return ['Super Admin', 'Admin', 'Design Manager', 'Procurement Manager', 'Project Manager', 'Accounts Manager', 'Manager'].includes(this.role);
};

UserSchema.methods.isStaff = function () {
    return ['Design Staff', 'Procurement Staff', 'Project Engineer', 'Site Engineer', 'Site Supervisor', 'Accounts Staff', 'Staff'].includes(this.role);
};

UserSchema.methods.getDepartment = function () {
    if (this.role.includes('Design')) return 'Design';
    if (this.role.includes('Procurement')) return 'Procurement';
    if (this.role.includes('Production') || this.role === 'Project Manager' || this.role === 'Project Engineer' || this.role === 'Site Engineer' || this.role === 'Site Supervisor') return 'Production';
    if (this.role.includes('Accounts')) return 'Accounts';
    return 'Admin';
};

module.exports = mongoose.model('User', UserSchema);
