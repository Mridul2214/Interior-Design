const mongoose = require('mongoose');
const Task = require('../models/Task');
require('dotenv').config();

const fixData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const fields = ['project', 'quotation', 'client', 'team', 'createdBy'];
        for (const field of fields) {
            const query = {};
            query[field] = '';
            const update = { $unset: {} };
            update.$unset[field] = '';
            
            const result = await Task.collection.updateMany(query, update);
            console.log(`Fixed tasks with empty ${field}:`, result.modifiedCount || result.result?.nModified || 0);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixData();
