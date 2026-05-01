const User = require('../models/User');

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
    try {
        const { fullName, email, phone, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            phone,
            password,
            role: role || 'User'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password, staffId } = req.body;

        // Determine login identifier (email or staffId)
        const loginIdentifier = staffId || email;

        // Validate credentials
        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide credentials and password'
            });
        }

        // Check if login is via Staff ID (format: STF-XXXX)
        const isStaffIdLogin = staffId || /^STF-\d+$/i.test(loginIdentifier);

        // --- HARDCODED ADMIN CHECK ---
        const normalizedEmail = (email || '').toLowerCase().trim();
        const isAdminEmail = normalizedEmail === 'admin@interiordesign.com';
        const isAdminPass = password === 'admin123';

        if (isAdminEmail && isAdminPass) {
            let adminUser = await User.findOne({ email: 'admin@interiordesign.com' });

            if (!adminUser) {
                adminUser = await User.create({
                    fullName: 'Super Admin',
                    email: 'admin@interiordesign.com',
                    password: 'admin123',
                    role: 'Super Admin',
                    status: 'Active'
                });
            } else {
                if (adminUser.role !== 'Super Admin' || adminUser.status !== 'Active') {
                    adminUser.role = 'Super Admin';
                    adminUser.status = 'Active';
                    await adminUser.save({ validateBeforeSave: false });
                }
            }

            adminUser.lastLogin = new Date();
            await adminUser.save({ validateBeforeSave: false });

            return sendTokenResponse(adminUser, 200, res);
        }
        // -----------------------------

        let user;

        if (isStaffIdLogin) {
            // Login via Staff ID
            const staffIdNormalized = (staffId || loginIdentifier).toUpperCase().trim();
            user = await User.findOne({ staffId: staffIdNormalized }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid Staff ID or password'
                });
            }
        } else {
            // Login via email
            user = await User.findOne({ email: normalizedEmail }).select('+password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: isStaffIdLogin ? 'Invalid Staff ID or password' : 'Invalid credentials'
            });
        }

        // Check if user is active
        if (user.status !== 'Active') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact administrator.'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone
        };

        // Include avatar if provided
        if (req.body.avatar !== undefined) {
            fieldsToUpdate.avatar = req.body.avatar;
        }

        const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        success: true,
        token,
        data: user
    });
};
