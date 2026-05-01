const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res) => {
    try {
        const { search, status, category, page = 1, limit = 1000 } = req.query;
        
        let query = {};
        
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { vendorCode: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (status) query.status = status;
        if (category) query.categories = category;
        
        const parsedLimit = parseInt(limit);
        const skip = (parseInt(page) - 1) * parsedLimit;
        
        const vendors = await Vendor.find(query)
            .populate('createdBy', 'fullName')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parsedLimit);
        
        const total = await Vendor.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: vendors.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: vendors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id)
            .populate('createdBy', 'fullName email');
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createVendor = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const vendor = await Vendor.create(req.body);
        
        res.status(201).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        let vendor = await Vendor.findById(req.params.id);
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }
        
        Object.keys(req.body).forEach(key => {
            vendor[key] = req.body[key];
        });
        
        await vendor.save();
        
        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteVendor = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.params.id);
        
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }
        
        await vendor.deleteOne();
        
        res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getVendorStats = async (req, res) => {
    try {
        const total = await Vendor.countDocuments();
        const active = await Vendor.countDocuments({ status: 'Active' });
        const inactive = await Vendor.countDocuments({ status: 'Inactive' });
        
        const categories = await Vendor.aggregate([
            { $unwind: '$categories' },
            { $group: { _id: '$categories', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                total,
                active,
                inactive,
                categories
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
