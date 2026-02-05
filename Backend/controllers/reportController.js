const Quotation = require('../models/Quotation');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Task = require('../models/Task');
const Inventory = require('../models/Inventory');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.getDashboardStats = async (req, res) => {
    try {
        // Quotation stats
        const totalQuotations = await Quotation.countDocuments();
        const pendingQuotations = await Quotation.countDocuments({ status: 'Pending' });
        const approvedQuotations = await Quotation.countDocuments({ status: 'Approved' });

        // Revenue stats
        const approvedRevenue = await Quotation.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const potentialRevenue = await Quotation.aggregate([
            { $match: { status: 'Pending' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Client stats
        const totalClients = await Client.countDocuments();
        const activeClients = await Client.countDocuments({ status: 'Active' });

        // Task stats
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'Completed' });
        const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });

        // Inventory alerts
        const lowStockItems = await Inventory.countDocuments({ status: 'Low Stock' });
        const outOfStockItems = await Inventory.countDocuments({ status: 'Out of Stock' });

        // Invoice stats
        const totalInvoices = await Invoice.countDocuments();
        const paidInvoices = await Invoice.countDocuments({ status: 'Paid' });
        const overdueInvoices = await Invoice.countDocuments({ status: 'Overdue' });

        res.status(200).json({
            success: true,
            data: {
                quotations: {
                    total: totalQuotations,
                    pending: pendingQuotations,
                    approved: approvedQuotations
                },
                revenue: {
                    approved: approvedRevenue[0]?.total || 0,
                    potential: potentialRevenue[0]?.total || 0
                },
                clients: {
                    total: totalClients,
                    active: activeClients
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    inProgress: inProgressTasks
                },
                inventory: {
                    lowStock: lowStockItems,
                    outOfStock: outOfStockItems
                },
                invoices: {
                    total: totalInvoices,
                    paid: paidInvoices,
                    overdue: overdueInvoices
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getRevenueReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let matchQuery = { status: 'Approved' };
        if (startDate && endDate) {
            matchQuery.approvedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const revenueByMonth = await Quotation.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: {
                        year: { $year: '$approvedAt' },
                        month: { $month: '$approvedAt' }
                    },
                    totalRevenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } }
        ]);

        res.status(200).json({
            success: true,
            data: revenueByMonth
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getQuotationReport = async (req, res) => {
    try {
        const statusBreakdown = await Quotation.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$totalAmount' } } }
        ]);

        const recentQuotations = await Quotation.find()
            .populate('client', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                statusBreakdown,
                recentQuotations
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getInventoryReport = async (req, res) => {
    try {
        const statusBreakdown = await Inventory.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const lowStockItems = await Inventory.find({ status: 'Low Stock' })
            .sort({ stock: 1 })
            .limit(20);

        const totalValue = await Inventory.aggregate([
            { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                statusBreakdown,
                lowStockItems,
                totalValue: totalValue[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
