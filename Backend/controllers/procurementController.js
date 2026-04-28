const MaterialRequest = require('../models/MaterialRequest');
const VendorComparison = require('../models/VendorComparison');
const PurchaseOrder = require('../models/PurchaseOrder');
const VendorPurchase = require('../models/VendorPurchase');
const Project = require('../models/Project');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { createNotification, notifyByRole, notifyUser } = require('../utils/notificationHelper');

exports.getMaterialRequests = async (req, res) => {
    try {
        const { project, status, priority, page = 1, limit = 10 } = req.query;

        let query = {};
        const role = req.user.role;

        if (role === 'Procurement Manager' || role === 'Procurement Staff') {
            // Procurement only sees requests that have passed Design Manager review
            query.status = status || { $nin: ['Design Review'] };
        } else if (role === 'Staff') {
            // Designer staff only sees their own requests
            query.requestedBy = req.user.id;
        }

        if (project) query.project = project;
        if (status && !query.status) {
            if (status.includes(',')) {
                query.status = { $in: status.split(',').map(s => s.trim()) };
            } else {
                query.status = status;
            }
        }
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

        // Auto-resolve project if missing but quotation is present
        if ((!req.body.project || req.body.project === "") && req.body.quotation) {
            const project = await Project.findOne({ quotation: req.body.quotation });
            if (project) req.body.project = project._id;
        }

        // Final check for project
        if (!req.body.project) {
            return res.status(400).json({ success: false, message: 'Project reference is required for material requests' });
        }

        // Set status based on role
        if (req.user.role === 'Staff') {
            req.body.status = 'Design Review';
        } else if (req.user.role === 'Design Manager') {
            req.body.status = 'Pending';
        }

        const request = await MaterialRequest.create(req.body);

        await Project.findByIdAndUpdate(req.body.project, {
            stage: 'Procurement'
        });

        if (request.status === 'Design Review') {
            await notifyByRole('Design Manager', {
                title: 'New Material Request for Review',
                description: `Staff has requested materials for "${request.requestNumber}". Needs your approval.`,
                type: 'Warning',
                relatedModel: 'MaterialRequest',
                relatedId: request._id
            });
        } else {
            await notifyByRole('Procurement Manager', {
                title: 'New Material Request',
                description: `Material request "${request.requestNumber}" needs procurement action.`,
                type: 'Info',
                relatedModel: 'MaterialRequest',
                relatedId: request._id
            });
        }

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

exports.approveMaterialRequest = async (req, res) => {
    try {
        const request = await MaterialRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Material request not found'
            });
        }

        request.status = 'Pending';
        request.managerRemarks = req.body.managerRemarks || 'Approved by Design Manager';
        await request.save();

        // Notify Procurement Manager
        await notifyByRole('Procurement Manager', {
            title: 'New Released Material Request',
            description: `Design Manager has approved/released request "${request.requestNumber}".`,
            type: 'Info',
            relatedModel: 'MaterialRequest',
            relatedId: request._id
        });

        // Notify Staff who requested it
        await notifyUser(request.requestedBy, {
            title: 'Material Request Approved',
            description: `Your material request "${request.requestNumber}" has been released to procurement.`,
            type: 'Success',
            relatedModel: 'MaterialRequest',
            relatedId: request._id
        });

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

exports.assignStaffToRequest = async (req, res) => {
    try {
        const { staffId } = req.body;
        const request = await MaterialRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Material request not found'
            });
        }

        const staff = await User.findOne({ _id: staffId, role: 'Procurement Staff' });
        if (!staff) {
            return res.status(400).json({
                success: false,
                message: 'Invalid staff member'
            });
        }

        request.assignedTo = staffId;
        request.status = 'Assigned';
        await request.save();

        await notifyUser(staffId, {
            title: 'Procurement Task Assigned',
            description: `You have been assigned to material request "${request.requestNumber}".`,
            type: 'Task',
            relatedModel: 'MaterialRequest',
            relatedId: request._id
        });

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

exports.getStaffTasks = async (req, res) => {
    try {
        const staffId = req.user.id;
        
        // 1. Get assigned MaterialRequests
        const mrs = await MaterialRequest.find({ assignedTo: staffId })
            .populate('project', 'name projectNumber stage')
            .populate('requestedBy', 'fullName')
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        // 2. Get assigned Tasks (e.g., 'Design Pushed' without MR)
        const Task = require('../models/Task');
        const tasks = await Task.find({ 
                assignedTo: { $in: [staffId] },
                status: { $in: ['Assigned to Procurement', 'In Progress', 'Completed'] }
            })
            .populate('project', 'name projectNumber stage')
            .populate('createdBy', 'fullName')
            .sort({ priority: -1, createdAt: -1 })
            .lean();

        // 3. Format and combine them
        const formattedMrs = mrs.map(m => ({ ...m, type: 'MaterialRequest' }));
        const formattedTasks = tasks.map(t => ({ 
            ...t, 
            type: 'Task',
            requestNumber: t.title, // Map title to requestNumber for UI consistency
            items: t.submissions?.[t.submissions?.length - 1]?.designItems || []
        }));
        
        const combined = [...formattedMrs, ...formattedTasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({
            success: true,
            count: combined.length,
            data: combined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.requestTimeExtension = async (req, res) => {
    try {
        const { requestedDate, reason } = req.body;
        const request = await MaterialRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Material request not found'
            });
        }

        if (request.assignedTo?.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this request'
            });
        }

        request.timeExtension = {
            requestedDate,
            reason,
            status: 'Pending',
            requestedBy: req.user.id
        };
        await request.save();

        const manager = await User.findOne({ role: 'Procurement Manager' });
        if (manager) {
            await notifyUser(manager._id, {
                title: 'Time Extension Requested',
                description: `Staff has requested time extension for material request "${request.requestNumber}".`,
                type: 'Info',
                relatedModel: 'MaterialRequest',
                relatedId: request._id
            });
        }

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

exports.respondTimeExtension = async (req, res) => {
    try {
        const { status, managerRemarks } = req.body;
        const request = await MaterialRequest.findById(req.params.id);

        if (!request || !request.timeExtension) {
            return res.status(404).json({
                success: false,
                message: 'Material request or time extension not found'
            });
        }

        request.timeExtension.status = status;
        request.timeExtension.managerRemarks = managerRemarks;
        request.timeExtension.reviewedBy = req.user.id;
        request.timeExtension.reviewedAt = new Date();

        if (status === 'Approved') {
            request.status = 'In Progress';
        }
        await request.save();

        if (request.assignedTo) {
            await notifyUser(request.assignedTo, {
                title: `Time Extension ${status}`,
                description: `Your time extension request has been ${status.toLowerCase()}.`,
                type: 'Info',
                relatedModel: 'MaterialRequest',
                relatedId: request._id
            });
        }

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

exports.createVendorPurchase = async (req, res) => {
    try {
        const { vendor, materialRequest, project, items, totalAmount, totalDiscount, finalAmount, expectedDeliveryDate, deliveryLocation, vendorLocation, notes } = req.body;

        const purchase = await VendorPurchase.create({
            vendor,
            materialRequest,
            project,
            items,
            totalAmount,
            totalDiscount,
            finalAmount,
            expectedDeliveryDate,
            deliveryLocation,
            vendorLocation,
            notes,
            purchasedBy: req.user.id
        });

        if (materialRequest) {
            await MaterialRequest.findByIdAndUpdate(materialRequest, {
                status: 'Purchasing',
                staffRemarks: notes
            });
        }

        if (vendor && items && items.length > 0) {
            for (const item of items) {
                await Vendor.updateOne(
                    { _id: vendor },
                    { $addToSet: { materialsSupplied: item.itemName } }
                );
            }
        }

        res.status(201).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getVendorPurchaseHistory = async (req, res) => {
    try {
        const { vendorId, search } = req.query;
        
        let query = {};
        if (vendorId) query.vendor = vendorId;

        let purchases = await VendorPurchase.find(query)
            .populate('vendor', 'name email phone address')
            .populate('project', 'name projectNumber')
            .populate('materialRequest', 'requestNumber')
            .populate('purchasedBy', 'fullName')
            .sort({ purchaseDate: -1 });

        if (search && search.trim()) {
            const searchLower = search.toLowerCase();
            purchases = purchases.filter(p => {
                const itemMatch = p.items.some(item => 
                    item.itemName.toLowerCase().includes(searchLower)
                );
                return itemMatch;
            });
        }

        const vendorStats = {};
        for (const purchase of purchases) {
            const vendorId = purchase.vendor._id.toString();
            if (!vendorStats[vendorId]) {
                vendorStats[vendorId] = {
                    vendor: purchase.vendor,
                    totalPurchases: 0,
                    totalAmount: 0,
                    items: {},
                    totalDiscount: 0
                };
            }
            vendorStats[vendorId].totalPurchases += 1;
            vendorStats[vendorId].totalAmount += purchase.finalAmount;
            vendorStats[vendorId].totalDiscount += purchase.totalDiscount;

            for (const item of purchase.items) {
                if (!vendorStats[vendorId].items[item.itemName]) {
                    vendorStats[vendorId].items[item.itemName] = {
                        quantity: 0,
                        totalAmount: 0,
                        totalDiscount: 0
                    };
                }
                vendorStats[vendorId].items[item.itemName].quantity += item.quantity;
                vendorStats[vendorId].items[item.itemName].totalAmount += item.amount;
                vendorStats[vendorId].items[item.itemName].totalDiscount += (item.amount - item.finalAmount);
            }
        }

        res.status(200).json({
            success: true,
            data: purchases,
            vendorStats: Object.values(vendorStats)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.compareVendorPrices = async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'Items are required for comparison'
            });
        }

        const itemNames = items.map(i => i.itemName);
        
        const purchases = await VendorPurchase.find({
            'items.itemName': { $in: itemNames }
        }).populate('vendor', 'name email phone address');

        const vendorPrices = {};
        for (const purchase of purchases) {
            const vendorId = purchase.vendor._id.toString();
            if (!vendorPrices[vendorId]) {
                vendorPrices[vendorId] = {
                    vendor: purchase.vendor,
                    items: {},
                    totalOriginalAmount: 0,
                    totalFinalAmount: 0,
                    totalDiscount: 0
                };
            }

            for (const item of purchase.items) {
                if (!vendorPrices[vendorId].items[item.itemName]) {
                    vendorPrices[vendorId].items[item.itemName] = {
                        quantity: 0,
                        rate: 0,
                        amount: 0,
                        finalAmount: 0,
                        discountPercent: 0
                    };
                }
                vendorPrices[vendorId].items[item.itemName].quantity += item.quantity;
                vendorPrices[vendorId].items[item.itemName].amount += item.amount;
                vendorPrices[vendorId].items[item.itemName].finalAmount += item.finalAmount;
            }
        }

        for (const vendorId in vendorPrices) {
            const vendor = vendorPrices[vendorId];
            for (const itemName in vendor.items) {
                const item = vendor.items[itemName];
                if (item.quantity > 0) {
                    item.rate = item.amount / item.quantity;
                }
                vendor.totalOriginalAmount += item.amount;
                vendor.totalFinalAmount += item.finalAmount;
                vendor.totalDiscount = vendor.totalOriginalAmount - vendor.totalFinalAmount;
            }
        }

        const comparisonResults = Object.values(vendorPrices).map(v => {
            let itemTotals = {};
            for (const itemName of itemNames) {
                if (v.items[itemName]) {
                    itemTotals[itemName] = {
                        rate: v.items[itemName].rate,
                        amount: v.items[itemName].amount,
                        finalAmount: v.items[itemName].finalAmount
                    };
                } else {
                    itemTotals[itemName] = null;
                }
            }

            let totalOriginal = 0;
            let totalFinal = 0;
            for (const item of items) {
                const itemData = itemTotals[item.itemName];
                if (itemData) {
                    totalOriginal += itemData.amount || (itemData.rate * item.quantity);
                    totalFinal += itemData.finalAmount || (itemData.rate * item.quantity);
                }
            }

            return {
                vendor: v.vendor,
                items: itemTotals,
                totalOriginalAmount: totalOriginal,
                totalFinalAmount: totalFinal,
                totalDiscountAmount: totalOriginal - totalFinal,
                totalDiscountPercent: totalOriginal > 0 ? ((totalOriginal - totalFinal) / totalOriginal) * 100 : 0
            };
        });

        comparisonResults.sort((a, b) => b.totalDiscountPercent - a.totalDiscountPercent);

        res.status(200).json({
            success: true,
            data: comparisonResults
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProcurementStaff = async (req, res) => {
    try {
        const staff = await User.find({ role: 'Procurement Staff', status: 'Active' })
            .select('fullName email phone');

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updatePurchaseStatus = async (req, res) => {
    try {
        const { status, actualDeliveryDate } = req.body;
        const purchase = await VendorPurchase.findById(req.params.id);

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Purchase not found'
            });
        }

        if (purchase.purchasedBy?.toString() !== req.user.id && req.user.role !== 'Procurement Manager') {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own purchases'
            });
        }

        purchase.status = status;
        if (status === 'Received' && actualDeliveryDate) {
            purchase.actualDeliveryDate = actualDeliveryDate;
        }
        await purchase.save();

        if (purchase.materialRequest) {
            let materialStatus = 'Completed';
            if (status === 'Ordered') materialStatus = 'Purchasing';
            if (status === 'Pending') materialStatus = 'Assigned';
            
            await MaterialRequest.findByIdAndUpdate(purchase.materialRequest, {
                status: materialStatus
            });
        }

        res.status(200).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
