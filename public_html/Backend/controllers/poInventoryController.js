const POInventory = require('../models/POInventory');

exports.getPOInventoryItems = async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { itemName: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { supplier: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const items = await POInventory.find(query)
            .populate('purchaseOrder', 'poNumber')
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await POInventory.countDocuments(query);

        res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: items
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPOInventoryItem = async (req, res) => {
    try {
        const item = await POInventory.findById(req.params.id)
            .populate('purchaseOrder')
            .populate('createdBy', 'fullName');
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createPOInventoryItem = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const item = await POInventory.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updatePOInventoryItem = async (req, res) => {
    try {
        let item = await POInventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        item = await POInventory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deletePOInventoryItem = async (req, res) => {
    try {
        const item = await POInventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        await item.deleteOne();
        res.status(200).json({ success: true, message: 'Item deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
