const MaterialRequest = require('../models/MaterialRequest');
const VendorComparison = require('../models/VendorComparison');
const PurchaseOrder = require('../models/PurchaseOrder');
const Project = require('../models/Project');
const { createNotification, notifyByRole } = require('../utils/notificationHelper');

exports.getMaterialRequests = async (req, res) => {
    try {
        const { project, status, priority, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (project) query.project = project;
        if (status) query.status = status;
        if (priority) query.priority = priority;
        
        const skip = (page - 1) * limit;
        
        const requests = await MaterialRequest.find(query)
            .populate('project', 'name projectNumber stage')
            .populate('requestedBy', 'fullName')
            .populate('assignedTo', 'fullName')
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await MaterialRequest.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: requests.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: requests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createMaterialRequest = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        req.body.requestedBy = req.user.id;
        
        const request = await MaterialRequest.create(req.body);
        
        await Project.findByIdAndUpdate(req.body.project, {
            stage: 'Procurement'
        });
        
        await notifyByRole('Procurement Manager', {
            title: 'New Material Request',
            description: `Material request "${request.requestNumber}" needs procurement action.`,
            type: 'Info',
            relatedModel: 'MaterialRequest',
            relatedId: request._id
        });
        
        res.status(201).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateMaterialRequest = async (req, res) => {
    try {
        const request = await MaterialRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Material request not found'
            });
        }
        
        Object.assign(request, req.body);
        await request.save();
        
        res.status(200).json({
            success: true,
            data: request
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createVendorComparison = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const comparison = await VendorComparison.create(req.body);
        
        res.status(201).json({
            success: true,
            data: comparison
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getVendorComparisons = async (req, res) => {
    try {
        const { project, status } = req.query;
        
        let query = {};
        if (project) query.project = project;
        if (status) query.status = status;
        
        const comparisons = await VendorComparison.find(query)
            .populate('materialRequest', 'requestNumber')
            .populate('project', 'name projectNumber')
            .populate('quotes.vendor', 'name email phone')
            .populate('selectedVendor', 'name')
            .populate('purchaseOrder', 'poNumber')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: comparisons.length,
            data: comparisons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.selectVendor = async (req, res) => {
    try {
        const { vendorId, quoteIndex } = req.body;
        
        const comparison = await VendorComparison.findById(req.params.id);
        
        if (!comparison) {
            return res.status(404).json({
                success: false,
                message: 'Comparison not found'
            });
        }
        
        comparison.quotes.forEach((q, i) => {
            q.selected = i === quoteIndex;
        });
        
        comparison.selectedVendor = vendorId;
        comparison.status = 'Approved';
        
        await comparison.save();
        
        await createNotification({
            title: 'Vendor Selected',
            description: `Vendor has been selected for comparison "${comparison.comparisonNumber}".`,
            type: 'Info',
            relatedModel: 'VendorComparison',
            relatedId: comparison._id
        });
        
        res.status(200).json({
            success: true,
            data: comparison
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createPOFromComparison = async (req, res) => {
    try {
        const comparison = await VendorComparison.findById(req.params.id)
            .populate('selectedVendor')
            .populate('project');
        
        if (!comparison || !comparison.selectedVendor) {
            return res.status(400).json({
                success: false,
                message: 'No vendor selected'
            });
        }
        
        const selectedQuote = comparison.quotes.find(q => q.selected);
        
        const po = await PurchaseOrder.create({
            supplier: comparison.selectedVendor.name,
            supplierContact: comparison.selectedVendor.phone,
            supplierEmail: comparison.selectedVendor.email,
            items: selectedQuote.items.map(item => ({
                itemName: item.itemName,
                quantity: item.quantity,
                unit: 'pieces',
                rate: item.rate,
                amount: item.amount
            })),
            deliveryAddress: comparison.project?.name || 'Project Site',
            createdBy: req.user.id
        });
        
        comparison.purchaseOrder = po._id;
        comparison.status = 'PO Created';
        await comparison.save();
        
        await notifyByRole('Production Manager', {
            title: 'Purchase Order Created',
            description: `PO "${po.poNumber}" has been created. Materials will be delivered soon.`,
            type: 'PO',
            relatedModel: 'PurchaseOrder',
            relatedId: po._id
        });
        
        res.status(201).json({
            success: true,
            data: { comparison, po }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProcurementStats = async (req, res) => {
    try {
        const pendingRequests = await MaterialRequest.countDocuments({ status: 'Pending' });
        const inProgressRequests = await MaterialRequest.countDocuments({ status: 'In Progress' });
        const completedRequests = await MaterialRequest.countDocuments({ status: 'Completed' });
        
        const pendingPOs = await PurchaseOrder.countDocuments({ 
            status: { $in: ['Draft', 'Pending', 'Approved', 'Ordered'] } 
        });
        const receivedPOs = await PurchaseOrder.countDocuments({ status: 'Received' });
        
        res.status(200).json({
            success: true,
            data: {
                materialRequests: {
                    pending: pendingRequests,
                    inProgress: inProgressRequests,
                    completed: completedRequests
                },
                purchaseOrders: {
                    pending: pendingPOs,
                    received: receivedPOs
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
