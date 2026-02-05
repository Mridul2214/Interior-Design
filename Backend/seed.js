const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('🌱 Seeding database...');

        // Clear existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});

        // Create Super Admin
        const superAdmin = await User.create({
            fullName: 'Super Admin',
            email: 'admin@interiordesign.com',
            phone: '+91 98765 43210',
            password: 'admin123',
            role: 'Super Admin',
            status: 'Active'
        });

        console.log('✅ Super Admin created:', superAdmin.email);

        // Create additional users
        const users = await User.insertMany([
            {
                fullName: 'John Manager',
                email: 'manager@interiordesign.com',
                phone: '+91 98765 43211',
                password: 'manager123',
                role: 'Manager',
                status: 'Active',
                createdBy: superAdmin._id
            },
            {
                fullName: 'Sarah Designer',
                email: 'designer@interiordesign.com',
                phone: '+91 98765 43212',
                password: 'designer123',
                role: 'Designer',
                status: 'Active',
                createdBy: superAdmin._id
            },
            {
                fullName: 'Mike Admin',
                email: 'admin2@interiordesign.com',
                phone: '+91 98765 43213',
                password: 'admin123',
                role: 'Admin',
                status: 'Active',
                createdBy: superAdmin._id
            }
        ]);

        console.log(`✅ ${users.length} additional users created`);

        console.log('\n📋 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Super Admin:');
        console.log('  Email: admin@interiordesign.com');
        console.log('  Password: admin123');
        console.log('\nManager:');
        console.log('  Email: manager@interiordesign.com');
        console.log('  Password: manager123');
        console.log('\nDesigner:');
        console.log('  Email: designer@interiordesign.com');
        console.log('  Password: designer123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
