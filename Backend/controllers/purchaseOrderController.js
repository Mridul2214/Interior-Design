const PurchaseOrder = require('../models/PurchaseOrder');

exports.getPurchaseOrders = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { poNumber: { $regex: search, $options: 'i' } },
                { supplier: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const pos = await PurchaseOrder.find(query)
            .populate('createdBy approvedBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await PurchaseOrder.countDocuments(query);

        res.status(200).json({
            success: true,
            count: pos.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: pos
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPurchaseOrder = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id)
            .populate('createdBy approvedBy', 'fullName');
        if (!po) {
            return res.status(404).json({ success: false, message: 'PO not found' });
        }
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPurchaseOrder = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const po = await PurchaseOrder.create(req.body);
        res.status(201).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePurchaseOrder = async (req, res) => {
    try {
        let po = await PurchaseOrder.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'PO not found' });
        }
        po = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePurchaseOrder = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'PO not found' });
        }
        await po.deleteOne();
        res.status(200).json({ success: true, message: 'PO deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approvePurchaseOrder = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'PO not found' });
        }
        po.status = 'Approved';
        po.approvedBy = req.user.id;
        po.approvedAt = new Date();
        await po.save();
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAsReceived = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) {
            return res.status(404).json({ success: false, message: 'PO not found' });
        }
        po.status = 'Received';
        po.actualDeliveryDate = new Date();
        await po.save();
        res.status(200).json({ success: true, data: po });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPOStats = async (req, res) => {
    try {
        const total = await PurchaseOrder.countDocuments();
        const pending = await PurchaseOrder.countDocuments({ status: 'Pending' });
        const ordered = await PurchaseOrder.countDocuments({ status: 'Ordered' });
        const received = await PurchaseOrder.countDocuments({ status: 'Received' });

        const totalValue = await PurchaseOrder.aggregate([
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        res.status(200).json({
            success: true,
            data: { total, pending, ordered, received, totalValue: totalValue[0]?.total || 0 }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
