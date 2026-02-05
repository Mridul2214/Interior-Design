const Invoice = require('../models/Invoice');

exports.getInvoices = async (req, res) => {
    try {
        const { search, status, client, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.invoiceNumber = { $regex: search, $options: 'i' };
        }
        if (status) query.status = status;
        if (client) query.client = client;

        const skip = (page - 1) * limit;
        const invoices = await Invoice.find(query)
            .populate('client', 'name email')
            .populate('quotation', 'quotationNumber')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Invoice.countDocuments(query);

        res.status(200).json({
            success: true,
            count: invoices.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: invoices
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id)
            .populate('client')
            .populate('quotation')
            .populate('createdBy', 'fullName');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createInvoice = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const invoice = await Invoice.create(req.body);
        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        let invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }
        await invoice.deleteOne();
        res.status(200).json({ success: true, message: 'Invoice deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.recordPayment = async (req, res) => {
    try {
        const { amount, paymentMethod, paymentDate } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        invoice.amountPaid += amount;
        invoice.paymentMethod = paymentMethod;
        invoice.paymentDate = paymentDate || new Date();

        await invoice.save();

        res.status(200).json({ success: true, data: invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInvoiceStats = async (req, res) => {
    try {
        const total = await Invoice.countDocuments();
        const paid = await Invoice.countDocuments({ status: 'Paid' });
        const unpaid = await Invoice.countDocuments({ status: 'Unpaid' });
        const overdue = await Invoice.countDocuments({ status: 'Overdue' });

        const totalRevenue = await Invoice.aggregate([
            { $match: { status: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$grandTotal' } } }
        ]);

        const pendingAmount = await Invoice.aggregate([
            { $match: { status: { $in: ['Unpaid', 'Partially Paid'] } } },
            { $group: { _id: null, total: { $sum: { $subtract: ['$grandTotal', '$amountPaid'] } } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                paid,
                unpaid,
                overdue,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingAmount: pendingAmount[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
