const { GoogleGenerativeAI } = require('@google/generative-ai');
const Client = require('../models/Client');
const Quotation = require('../models/Quotation');
const Inventory = require('../models/Inventory');
const Task = require('../models/Task');

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn('⚠️ WARNING: GEMINI_API_KEY is not defined in your environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey || 'MISSING_KEY');

/**
 * @desc    Process general AI queries with system context
 * @route   POST /api/ai/query
 */
exports.queryAI = async (req, res) => {
    try {
        const { prompt, currentPath, pageState } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        // 1. Gather dynamic context based on the request
        const [clients, inventory, tasks] = await Promise.all([
            Client.find().limit(20).select('name company'),
            Inventory.find().limit(50).select('itemName section price unit'),
            Task.find({ status: { $ne: 'Completed' } }).limit(10).select('title status priority')
        ]);

        const systemContext = {
            availableClients: clients,
            availableInventory: inventory,
            activeTasks: tasks,
            currentView: currentPath,
            pageData: pageState
        };

        // 2. Define System Instruction
        const systemInstruction = `
            You are "Antigravity AI", a high-end AI assistant for an Interior Design Management System.
            Your goal is to help designers manage projects, create quotations, and analyze data.
            
            CONTEXT PROVIDED:
            ${JSON.stringify(systemContext)}

            CAPABILITIES:
            1. SHOW_FORM (QUOTATION): JSON: { "action": "SHOW_FORM", "formType": "QUOTATION", "data": { "projectName": "...", "clientName": "...", "items": [...] } }
            2. SHOW_FORM (CLIENT): JSON: { "action": "SHOW_FORM", "formType": "CLIENT", "data": { "name": "...", "email": "...", "phone": "...", "address": "...", "siteAddress": "..." } }
            3. SHOW_FORM (INVENTORY): JSON: { "action": "SHOW_FORM", "formType": "INVENTORY", "data": { "itemName": "...", "description": "...", "section": "...", "price": 0, "unit": "..." } }
            4. SHOW_FORM (TASK): JSON: { "action": "SHOW_FORM", "formType": "TASK", "data": { "title": "...", "priority": "Medium", "dueDate": "..." } }
            5. NAVIGATE: JSON: { "action": "NAVIGATE", "path": "/path" }

            STRICT OPERATING RULES:
            - NO CHATTING: Do not ask "What is the email?" or "Which client?". 
            - FORM-FIRST: As soon as the user mentions adding/creating something, IMMEDIATELY return the relevant SHOW_FORM action.
            - PRE-FILL: Put whatever info you found (even partial) into the "data" object. Leave the rest for the user to type in the form.
            - RESPONSE FORMAT: Return a very short confirmation text (max 5 words) followed by ONLY the raw JSON action object at the end.
            - DO NOT wrap the JSON in markdown code blocks or "json_action" fields.
        `;

        // 3. Initialize Model - Using gemini-2.0-flash-lite for potentially better quota availability
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        // Combined Contextual Prompt
        const combinedPrompt = `
SYSTEM INSTRUCTION:
${systemInstruction}

USER REQUEST:
${prompt}
        `;

        const result = await model.generateContent(combinedPrompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({
            success: true,
            data: text,
            contextUsed: {
                clients: clients.length,
                inventory: inventory.length
            }
        });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ success: false, message: 'AI processing failed: ' + error.message });
    }
};

/**
 * @desc    Smart suggestions for fields
 * @route   POST /api/ai/suggest
 */
exports.getSuggestion = async (req, res) => {
    try {
        const { type, field, value } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

        const prompt = `Give a 10-word professional interior design suggestion for the field "${field}" when the value is "${value}". Type: ${type}.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.status(200).json({
            success: true,
            suggestion: response.text().trim()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
