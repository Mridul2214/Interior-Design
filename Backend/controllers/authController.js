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
        console.log('--- LOGIN ATTEMPT START ---');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Please provide an email and password'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const isAdminEmail = normalizedEmail === 'admin@interiordesign.com';
        const isAdminPass = password === 'admin123';

        console.log(`Normalized Email: '${normalizedEmail}'`);
        console.log(`Is Admin Email? ${isAdminEmail}`);
        console.log(`Is Admin Pass? ${isAdminPass}`);

        // --- HARDCODED ADMIN CHECK ---
        // Ensures admin@interiordesign.com / admin123 always works
        // and creates the user in DB if missing (to satisfy middleware)
        if (isAdminEmail && isAdminPass) {
            console.log('>>> ENTERING ADMIN HARDCODED BLOCK <<<');
            let adminUser = await User.findOne({ email: 'admin@interiordesign.com' }); // Ensure we find by normalized email

            if (!adminUser) {
                console.log('Admin user not found, auto-creating...');
                // Auto-create if not exists
                adminUser = await User.create({
                    fullName: 'Super Admin',
                    email: 'admin@interiordesign.com',
                    password: 'admin123', // Will be hashed by pre-save hook
                    role: 'Super Admin',
                    status: 'Active'
                });
            } else {
                // Determine if we need to update the role or status
                if (adminUser.role !== 'Super Admin' || adminUser.status !== 'Active') {
                    adminUser.role = 'Super Admin';
                    adminUser.status = 'Active';
                    await adminUser.save({ validateBeforeSave: false });
                }
            }

            // Update last login
            adminUser.lastLogin = new Date();
            await adminUser.save({ validateBeforeSave: false });

            return sendTokenResponse(adminUser, 200, res);
        }
        // -----------------------------

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
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
