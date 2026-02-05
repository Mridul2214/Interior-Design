const Client = require('../models/Client');
const Quotation = require('../models/Quotation');
const Inventory = require('../models/Inventory');
const Task = require('../models/Task');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');
const POInventory = require('../models/POInventory');

/**
 * @desc    Get AI assist results based on system context
 * @route   POST /api/ai/query
 * @access  Private
 */
exports.queryAI = async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a prompt'
            });
        }

        // Fetch context from the system (excluding User details)
        const [clients, quotations, inventory, tasks, pos, invoices, poInventory] = await Promise.all([
            Client.find().limit(50).select('-createdBy'),
            Quotation.find().limit(20).populate('client', 'name').select('-createdBy'),
            Inventory.find().limit(50).select('-createdBy'),
            Task.find().limit(50).populate('assignedTo', 'fullName').select('-createdBy'),
            PurchaseOrder.find().limit(20).select('-createdBy'),
            Invoice.find().limit(20).populate('client', 'name').select('-createdBy'),
            POInventory.find().limit(50).select('-createdBy')
        ]);

        const context = {
            clients: clients.map(c => ({ name: c.name, email: c.email, status: c.status })),
            quotations: quotations.map(q => ({ number: q.quotationNumber, project: q.projectName, total: q.totalAmount, status: q.status, client: q.client?.name })),
            inventory: inventory.map(i => ({ item: i.itemName, section: i.section, stock: i.stock, price: i.price })),
            tasks: tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, assignedTo: t.assignedTo?.fullName })),
            purchaseOrders: pos.map(p => ({ number: p.poNumber, supplier: p.supplier, total: p.totalAmount, status: p.status })),
            invoices: invoices.map(v => ({ number: v.invoiceNumber, client: v.client?.name, total: v.grandTotal, status: v.status })),
            poInventory: poInventory.map(p => ({ item: p.itemName, supplier: p.supplier, stock: p.currentStock }))
        };

        // Note: In a real implementation, you would send this 'context' and 'prompt' to an LLM (like Gemini or OpenAI)
        // For now, we'll return a simulated AI response that shows it recognized the context

        // This is where you would call: const response = await callAI(prompt, context);

        res.status(200).json({
            success: true,
            message: 'AI assistant is ready. (Note: Integrate your preferred AI SDK like @google/generative-ai here)',
            contextPreview: `System has access to ${clients.length} clients, ${quotations.length} quotations, and ${inventory.length} inventory items.`,
            simulatedResponse: `I see you're asking about "${prompt}". Based on your system data, you have ${inventory.length} items in inventory and ${tasks.filter(t => t.status !== 'Completed').length} active tasks. How can I help further?`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc    Generate a smart suggestion for a specific entity
 * @route   POST /api/ai/suggest
 * @access  Private
 */
exports.getSuggestion = async (req, res) => {
    try {
        const { type, contextData } = req.body;

        // Logic for specific suggestions (e.g., pricing for a quotation, due date for a task)
        res.status(200).json({
            success: true,
            suggestion: `Based on previous ${type}s, I suggest focusing on quality materials and a 15% margin.`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
