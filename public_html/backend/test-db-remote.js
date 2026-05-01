const mongoose = require('mongoose');
require('dotenv').config();
const ProductionProject = require('./models/ProductionProject');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    console.log("Connected to Remote DB");
    const projects = await ProductionProject.find();
    console.log("Projects in DB:", projects.length);
    process.exit(0);
}).catch(console.error);
