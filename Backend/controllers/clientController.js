const Client = require('../models/Client');

/**
 * @desc    Get all clients
 * @route   GET /api/clients
 * @access  Private
 */
exports.getClients = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;

        // Build query
        let query = {};

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { clientGST: { $regex: search, $options: 'i' } },
                { clientManager: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Pagination
        const skip = (page - 1) * limit;

        const clients = await Client.find(query)
            .populate('createdBy', 'fullName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Client.countDocuments(query);

        res.status(200).json({
            success: true,
            count: clients.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get single client
 * @route   GET /api/clients/:id
 * @access  Private
 */
exports.getClient = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.id)
            .populate('createdBy', 'fullName email');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Create new client
 * @route   POST /api/clients
 * @access  Private
 */
exports.createClient = async (req, res, next) => {
    try {
        // Add user to req.body
        req.body.createdBy = req.user.id;

        const client = await Client.create(req.body);

        res.status(201).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update client
 * @route   PUT /api/clients/:id
 * @access  Private
 */
exports.updateClient = async (req, res, next) => {
    try {
        let client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete client
 * @route   DELETE /api/clients/:id
 * @access  Private (Admin only)
 */
exports.deleteClient = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        await client.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Client deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get client statistics
 * @route   GET /api/clients/stats
 * @access  Private
 */
exports.getClientStats = async (req, res, next) => {
    try {
        const totalClients = await Client.countDocuments();
        const activeClients = await Client.countDocuments({ status: 'Active' });
        const inactiveClients = await Client.countDocuments({ status: 'Inactive' });

        res.status(200).json({
            success: true,
            data: {
                total: totalClients,
                active: activeClients,
                inactive: inactiveClients
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
