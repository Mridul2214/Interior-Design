const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const count = await User.countDocuments();
        console.log(`Total Users: ${count}`);
        
        const admin = await User.findOne({ email: 'admin@interiordesign.com' }).select('+password');
        if (admin) {
            console.log('Admin user found:');
            console.log('Email:', admin.email);
            console.log('Role:', admin.role);
            console.log('Status:', admin.status);
            console.log('Password Hash in DB:', admin.password);
        } else {
            console.log('Admin user NOT FOUND in database!');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDB();
