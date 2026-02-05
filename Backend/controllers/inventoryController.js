const Inventory = require('../models/Inventory');

exports.getInventoryItems = async (req, res) => {
    try {
        const { search, section, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { itemName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { section: { $regex: search, $options: 'i' } }
            ];
        }

        if (section) query.section = section;
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const items = await Inventory.find(query)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Inventory.countDocuments(query);

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

exports.getInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id).populate('createdBy', 'fullName');
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createInventoryItem = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const item = await Inventory.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateInventoryItem = async (req, res) => {
    try {
        let item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        await item.deleteOne();
        res.status(200).json({ success: true, message: 'Item deleted', data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventoryStats = async (req, res) => {
    try {
        const total = await Inventory.countDocuments();
        const inStock = await Inventory.countDocuments({ status: 'In Stock' });
        const lowStock = await Inventory.countDocuments({ status: 'Low Stock' });
        const outOfStock = await Inventory.countDocuments({ status: 'Out of Stock' });

        res.status(200).json({
            success: true,
            data: { total, inStock, lowStock, outOfStock }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
