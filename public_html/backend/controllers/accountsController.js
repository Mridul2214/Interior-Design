const Expense = require('../models/Expense');
const Project = require('../models/Project');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { createNotification } = require('../utils/notificationHelper');

exports.getExpenses = async (req, res) => {
    try {
        const { project, type, status, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (project) query.project = project;
        if (type) query.type = type;
        if (status) query.paymentStatus = status;
        
        const skip = (page - 1) * limit;
        
        const expenses = await Expense.find(query)
            .populate('project', 'name projectNumber')
            .populate('vendor', 'name')
            .populate('createdBy', 'fullName')
            .sort({ expenseDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Expense.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: expenses.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: expenses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createExpense = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        
        const expense = await Expense.create(req.body);
        
        await Project.findByIdAndUpdate(req.body.project, {
            $inc: { spent: req.body.amount }
        });
        
        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateExpense = async (req, res) => {
    try {
        const oldExpense = await Expense.findById(req.params.id);
        
        if (!oldExpense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }
        
        const amountDiff = (req.body.amount || oldExpense.amount) - oldExpense.amount;
        
        if (amountDiff !== 0) {
            await Project.findByIdAndUpdate(oldExpense.project, {
                $inc: { spent: amountDiff }
            });
        }
        
        Object.assign(oldExpense, req.body);
        await oldExpense.save();
        
        res.status(200).json({
            success: true,
            data: oldExpense
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getPayments = async (req, res) => {
    try {
        const { project, invoice, client, page = 1, limit = 10 } = req.query;
        
        let query = {};
        
        if (project) query.project = project;
        if (invoice) query.invoice = invoice;
        if (client) query.client = client;
        
        const skip = (page - 1) * limit;
        
        const payments = await Payment.find(query)
            .populate('project', 'name projectNumber')
            .populate('invoice', 'invoiceNumber grandTotal')
            .populate('client', 'name')
            .populate('receivedBy', 'fullName')
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Payment.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: payments.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            data: payments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.createPayment = async (req, res) => {
    try {
        req.body.receivedBy = req.user.id;
        
        const payment = await Payment.create(req.body);
        
        const invoice = await Invoice.findById(req.body.invoice);
        if (invoice) {
            invoice.amountPaid += req.body.amount;
            if (invoice.amountPaid >= invoice.grandTotal) {
                invoice.status = 'Paid';
                invoice.paymentDate = new Date();
            } else {
                invoice.status = 'Partially Paid';
            }
            await invoice.save();
        }
        
        await createNotification({
            title: 'Payment Received',
            description: `Payment of ₹${req.body.amount.toLocaleString('en-IN')} received.`,
            type: 'Invoice',
            relatedModel: 'Payment',
            relatedId: payment._id,
            createdBy: req.user.id
        });
        
        res.status(201).json({
            success: true,
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getProjectFinancials = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        
        const expenses = await Expense.find({ project: projectId });
        const payments = await Payment.find({ project: projectId });
        const invoices = await Invoice.find({ project: projectId });
        const project = await Project.findById(projectId);
        
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalInvoiced = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
        const totalReceived = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
        
        const profit = totalReceived - totalExpenses;
        const profitMargin = totalReceived > 0 ? ((profit / totalReceived) * 100).toFixed(2) : 0;
        
        res.status(200).json({
            success: true,
            data: {
                project: {
                    name: project?.name,
                    budget: project?.budget || 0,
                    spent: project?.spent || 0
                },
                expenses: {
                    total: totalExpenses,
                    byType: expenses.reduce((acc, e) => {
                        acc[e.type] = (acc[e.type] || 0) + e.amount;
                        return acc;
                    }, {}),
                    count: expenses.length
                },
                invoices: {
                    total: totalInvoiced,
                    received: totalReceived,
                    pending: totalInvoiced - totalReceived,
                    count: invoices.length
                },
                payments: {
                    total: totalPayments,
                    count: payments.length
                },
                profit: {
                    value: profit,
                    margin: parseFloat(profitMargin)
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

exports.getAccountsStats = async (req, res) => {
    try {
        const totalExpenses = await Expense.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const totalPayments = await Payment.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        const pendingInvoices = await Invoice.countDocuments({ 
            status: { $in: ['Unpaid', 'Partially Paid', 'Overdue'] } 
        });
        
        const paidInvoices = await Invoice.countDocuments({ status: 'Paid' });
        
        const expensesByType = await Expense.aggregate([
            { $group: { _id: '$type', total: { $sum: '$amount' } } },
            { $sort: { total: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                totalExpenses: totalExpenses[0]?.total || 0,
                totalPayments: totalPayments[0]?.total || 0,
                pendingInvoices,
                paidInvoices,
                expensesByType
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
