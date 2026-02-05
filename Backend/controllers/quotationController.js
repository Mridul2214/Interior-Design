const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');

/**
 * @desc    Get all quotations
 * @route   GET /api/quotations
 * @access  Private
 */
exports.getQuotations = async (req, res) => {
    try {
        const { search, status, client, page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            query.$or = [
                { quotationNumber: { $regex: search, $options: 'i' } },
                { projectName: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) query.status = status;
        if (client) query.client = client;

        const skip = (page - 1) * limit;

        const quotations = await Quotation.find(query)
            .populate('client', 'name email phone')
            .populate('createdBy', 'fullName email')
            .populate('approvedBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Quotation.countDocuments(query);

        res.status(200).json({
            success: true,
            count: quotations.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: quotations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get single quotation
 * @route   GET /api/quotations/:id
 * @access  Private
 */
exports.getQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .populate('client')
            .populate('createdBy', 'fullName email')
            .populate('approvedBy', 'fullName');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Create new quotation
 * @route   POST /api/quotations
 * @access  Private
 */
exports.createQuotation = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;

        const quotation = await Quotation.create(req.body);

        res.status(201).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Update quotation
 * @route   PUT /api/quotations/:id
 * @access  Private
 */
exports.updateQuotation = async (req, res) => {
    try {
        let quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Delete quotation
 * @route   DELETE /api/quotations/:id
 * @access  Private (Admin only)
 */
exports.deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        await quotation.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Quotation deleted successfully',
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
 * @desc    Approve quotation
 * @route   PUT /api/quotations/:id/approve
 * @access  Private (Admin/Manager)
 */
exports.approveQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        quotation.status = 'Approved';
        quotation.approvedBy = req.user.id;
        quotation.approvedAt = new Date();

        await quotation.save();

        // Create an Invoice automatically from the approved quotation
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15); // Default 15 days due date

        const invoiceItems = quotation.items.map(item => ({
            description: `${item.itemName} ${item.section ? `(${item.section})` : ''}`,
            quantity: item.quantity,
            rate: item.rate,
            tax: quotation.taxRate || 18,
            amount: item.amount
        }));

        await Invoice.create({
            client: quotation.client,
            quotation: quotation._id,
            invoiceDate: new Date(),
            dueDate: dueDate,
            items: invoiceItems,
            subtotal: quotation.subtotal,
            totalTax: quotation.taxAmount,
            grandTotal: quotation.totalAmount,
            status: 'Draft',
            createdBy: req.user.id,
            notes: quotation.notes,
            termsAndConditions: quotation.termsAndConditions
        });

        res.status(200).json({
            success: true,
            data: quotation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Get quotation statistics
 * @route   GET /api/quotations/stats
 * @access  Private
 */
exports.getQuotationStats = async (req, res) => {
    try {
        const total = await Quotation.countDocuments();
        const pending = await Quotation.countDocuments({ status: 'Pending' });
        const approved = await Quotation.countDocuments({ status: 'Approved' });
        const rejected = await Quotation.countDocuments({ status: 'Rejected' });

        const totalRevenue = await Quotation.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const potentialRevenue = await Quotation.aggregate([
            { $match: { status: 'Pending' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                approved,
                rejected,
                totalRevenue: totalRevenue[0]?.total || 0,
                potentialRevenue: potentialRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
