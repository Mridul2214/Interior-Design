const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Project = require('../models/Project');
const Checklist = require('../models/Checklist');
const { createNotification, notifyByRole } = require('../utils/notificationHelper');
const { logAction } = require('../services/auditService');

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

        const roleLower = req.user.role.toLowerCase();
        if (roleLower.includes('procurement')) {
            query.status = { $in: ['Sent to Procurement', 'Approved'] };
        }

        if (roleLower === 'staff' && !roleLower.includes('procurement')) {
            const Staff = require('../models/Staff');
            const Task = require('../models/Task');
            const staffMember = await Staff.findOne({ email: req.user.email });
            if (staffMember) {
                const assignedTasks = await Task.find({ assignedTo: staffMember._id }).select('quotation');
                const quoteIds = [...new Set(assignedTasks.map(t => t.quotation).filter(q => q))];
                query._id = { $in: quoteIds };
            } else {
                return res.status(200).json({ success: true, count: 0, data: [] });
            }
        }

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

exports.createQuotation = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;

        const quotation = await Quotation.create(req.body);

        await createNotification({
            title: 'New Quotation Created',
            description: `Quotation "${quotation.projectName || quotation.quotationNumber}" worth ₹${quotation.totalAmount?.toLocaleString('en-IN') || 0} has been created.`,
            type: 'Quote',
            relatedModel: 'Quotation',
            relatedId: quotation._id,
            createdBy: req.user.id
        });

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

exports.updateQuotation = async (req, res) => {
    try {
        let quotation = await Quotation.findById(req.params.id);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        // Create version snapshot if items are being modified
        if (req.body.items && req.body.items !== quotation.items) {
            const versionSnapshot = {
                version: quotation.currentVersion,
                items: JSON.parse(JSON.stringify(quotation.items)),
                subtotal: quotation.subtotal,
                taxRate: quotation.taxRate,
                taxAmount: quotation.taxAmount,
                discount: quotation.discount,
                offerPrice: quotation.offerPrice,
                totalAmount: quotation.totalAmount,
                createdAt: new Date(),
                createdBy: quotation.createdBy
            };

            quotation.versions.push(versionSnapshot);
            quotation.currentVersion += 1;
            quotation.version = quotation.currentVersion;
        }

        // Handle revision request
        if (req.body.status === 'Revision') {
            quotation.revisionRequestedBy = req.user.id;
            quotation.revisionRequestedAt = new Date();
            quotation.revisionReason = req.body.revisionReason || '';

            logAction({
                userId: req.user.id,
                action: 'Revision Requested',
                module: 'BOQ',
                referenceId: quotation._id,
                referenceModel: 'Quotation',
                newValue: { status: 'Revision', reason: req.body.revisionReason },
                description: `Revision requested for quotation "${quotation.projectName || quotation.quotationNumber}"`
            });

            await createNotification({
                title: 'BOQ Revision Requested',
                description: `Revision requested for quotation "${quotation.projectName || quotation.quotationNumber}".${req.body.revisionReason ? ` Reason: ${req.body.revisionReason}` : ''}`,
                type: 'Quote',
                relatedModel: 'Quotation',
                relatedId: quotation._id,
                createdBy: req.user.id
            });
        }

        // Handle rejection
        if (req.body.status === 'Rejected') {
            quotation.rejectedBy = req.user.id;
            quotation.rejectedAt = new Date();
            quotation.rejectionReason = req.body.rejectionReason || '';

            logAction({
                userId: req.user.id,
                action: 'BOQ Rejected',
                module: 'BOQ',
                referenceId: quotation._id,
                referenceModel: 'Quotation',
                newValue: { status: 'Rejected', reason: req.body.rejectionReason },
                description: `Quotation "${quotation.projectName || quotation.quotationNumber}" rejected`
            });

            await createNotification({
                title: 'BOQ Rejected',
                description: `Quotation "${quotation.projectName || quotation.quotationNumber}" has been rejected.${req.body.rejectionReason ? ` Reason: ${req.body.rejectionReason}` : ''}`,
                type: 'Error',
                relatedModel: 'Quotation',
                relatedId: quotation._id,
                createdBy: req.user.id
            });
        }

        // Handle approval (Design Approved)
        if (req.body.status === 'Design Approved') {
            quotation.approvedBy = req.user.id;
            quotation.approvedAt = new Date();

            logAction({
                userId: req.user.id,
                action: 'BOQ Design Approved',
                module: 'BOQ',
                referenceId: quotation._id,
                referenceModel: 'Quotation',
                newValue: { status: 'Design Approved', approvedBy: req.user.id },
                description: `Quotation "${quotation.projectName || quotation.quotationNumber}" design approved`
            });

            await createNotification({
                title: 'BOQ Design Approved',
                description: `Quotation "${quotation.projectName || quotation.quotationNumber}" has been approved by design manager.`,
                type: 'Success',
                relatedModel: 'Quotation',
                relatedId: quotation._id,
                createdBy: req.user.id
            });
        }

        Object.keys(req.body).forEach(key => {
            quotation[key] = req.body[key];
        });

        await quotation.save();

        res.status(200).json({
            success: true,
            data: quotation,
            message: 'Quotation updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

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

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 15);

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

        const project = await Project.create({
            client: quotation.client,
            quotation: quotation._id,
            name: quotation.projectName,
            description: `Project created from quotation ${quotation.quotationNumber}`,
            budget: quotation.totalAmount,
            stage: 'Design',
            status: 'Not Started',
            createdBy: req.user.id
        });

        const defaultSteps = [
            { name: 'Demolition', order: 1 },
            { name: 'Cleaning', order: 2 },
            { name: 'Installation', order: 3 },
            { name: 'Final Handover', order: 4 }
        ];

        await Checklist.create({
            project: project._id,
            steps: defaultSteps,
            createdBy: req.user.id
        });

        await createNotification({
            title: 'Quotation Approved - Project Created',
            description: `Quotation "${quotation.projectName || quotation.quotationNumber}" approved. Project "${project.name}" (${project.projectNumber}) created and moved to Design stage.`,
            type: 'Quote',
            relatedModel: 'Project',
            relatedId: project._id,
            createdBy: req.user.id
        });

        await notifyByRole('Design Manager', {
            title: 'New Project Ready for Design',
            description: `Project "${project.name}" requires design work. Please review and assign designers.`,
            type: 'Info',
            relatedModel: 'Project',
            relatedId: project._id
        });

        res.status(200).json({
            success: true,
            data: { quotation, project }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getQuotationStats = async (req, res) => {
    try {
        const total = await Quotation.countDocuments();
        const pending = await Quotation.countDocuments({ status: 'Under Review' });
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

exports.getVersionHistory = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id)
            .select('versions currentVersion quotationNumber projectName')
            .populate('versions.createdBy', 'fullName');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        res.status(200).json({
            success: true,
            currentVersion: quotation.currentVersion,
            versions: quotation.versions,
            data: quotation.versions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.compareVersions = async (req, res) => {
    try {
        const { v1, v2 } = req.query;

        const quotation = await Quotation.findById(req.params.id)
            .select('versions currentVersion items subtotal taxRate taxAmount discount offerPrice totalAmount');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found'
            });
        }

        const version1 = v1 ? quotation.versions.find(v => v.version === parseInt(v1)) : null;
        const version2 = v2 ? quotation.versions.find(v => v.version === parseInt(v2)) : null;
        const currentData = {
            items: quotation.items,
            subtotal: quotation.subtotal,
            taxRate: quotation.taxRate,
            taxAmount: quotation.taxAmount,
            discount: quotation.discount,
            offerPrice: quotation.offerPrice,
            totalAmount: quotation.totalAmount
        };

        res.status(200).json({
            success: true,
            data: {
                current: currentData,
                version1: version1 || null,
                version2: version2 || null,
                canCompare: !!(version1 && version2)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.calculateTotals = async (req, res) => {
    try {
        const { items, taxRate, discount } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Items array is required'
            });
        }

        // Calculate line totals
        const calculatedItems = items.map(item => ({
            ...item,
            amount: (item.quantity || 0) * (item.rate || 0)
        }));

        // Calculate subtotal
        const subtotal = calculatedItems.reduce((sum, item) => sum + (item.amount || 0), 0);

        // Calculate discount
        const discountAmount = (subtotal * (discount || 0)) / 100;
        const offerPrice = subtotal - discountAmount;

        // Calculate tax
        const taxAmount = (offerPrice * (taxRate || 0)) / 100;
        const totalAmount = offerPrice + taxAmount;

        res.status(200).json({
            success: true,
            data: {
                items: calculatedItems,
                subtotal,
                discountAmount,
                offerPrice,
                taxRate: taxRate || 0,
                taxAmount,
                totalAmount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
