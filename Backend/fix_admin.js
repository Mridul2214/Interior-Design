const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'admin@interiordesign.com';

        // Find existing
        let admin = await User.findOne({ email });
        console.log('Existing Admin:', admin ? 'Found' : 'Not Found');

        if (admin) {
            console.log('Updating existing admin...');
            admin.password = 'admin123';
            admin.role = 'Super Admin';
            admin.status = 'Active';
            await admin.save();
            console.log('Admin updated successfully');
        } else {
            console.log('Creating new admin...');
            try {
                admin = await User.create({
                    fullName: 'Super Admin',
                    email,
                    password: 'admin123',
                    role: 'Super Admin',
                    status: 'Active'
                });
                console.log('Admin created successfully');
            } catch (err) {
                console.log('Error creating admin:', err.message);
                // Maybe duplicate key error on different casing?
                if (err.code === 11000) {
                    console.log('Duplicate key error. Trying to find by case-insensitive regex...');
                    admin = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
                    if (admin) {
                        console.log('Found with case-insensitive search. Updating...');
                        admin.email = email; // Fix casing
                        admin.password = 'admin123';
                        admin.role = 'Super Admin';
                        admin.status = 'Active';
                        await admin.save();
                        console.log('Admin updated successfully');
                    }
                }
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

fixAdmin();
