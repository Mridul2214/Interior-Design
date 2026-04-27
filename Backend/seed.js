const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🌱 Seeding database with dashboard users...\n');

        // Clear existing users with dashboard roles (optional - uncomment if needed)
        await User.deleteMany({
            role: {
                $in: [
                    'Design Manager', 'Design Staff',
                    'Procurement Manager', 'Procurement Staff',
                    'Project Manager', 'Project Engineer', 'Site Engineer', 'Site Supervisor',
                    'Accounts Manager', 'Accounts Staff',
                    'Super Admin', 'Admin', 'Manager'
                ]
            }
        });

        // Create all dashboard users
        const users = [
            // Super Admin & Admin
            // {
            //     fullName: 'Rajesh Kumar',
            //     email: 'superadmin@interiordesign.com',
            //     phone: '9876543210',
            //     password: 'password123',
            //     role: 'Super Admin',
            //     status: 'Active'
            // },
            {
                fullName: 'Priya Sharma',
                email: 'admin@interiordesign.com',
                phone: '9876543211',
                password: 'password123',
                role: 'Admin',
                status: 'Active'
            },

            // Design Department
            {
                fullName: 'Ananya Gupta',
                email: 'design.manager@interiordesign.com',
                phone: '9876543212',
                password: 'password123',
                role: 'Design Manager',
                department: 'Design',
                status: 'Active'
            },
            {
                fullName: 'Rahul Verma',
                email: 'design.staff@interiordesign.com',
                phone: '9876543213',
                password: 'password123',
                role: 'Design Staff',
                department: 'Design',
                status: 'Active'
            },
            {
                fullName: 'Sneha Patel',
                email: 'designer1@interiordesign.com',
                phone: '9876543214',
                password: 'password123',
                role: 'Design Staff',
                department: 'Design',
                status: 'Active'
            },

            // Procurement Department
            {
                fullName: 'Vikram Singh',
                email: 'procurement.manager@interiordesign.com',
                phone: '9876543215',
                password: 'password123',
                role: 'Procurement Manager',
                department: 'Procurement',
                status: 'Active'
            },
            {
                fullName: 'Meera Joshi',
                email: 'procurement.staff@interiordesign.com',
                phone: '9876543216',
                password: 'password123',
                role: 'Procurement Staff',
                department: 'Procurement',
                status: 'Active'
            },
            {
                fullName: 'Amit Shah',
                email: 'procurement1@interiordesign.com',
                phone: '9876543217',
                password: 'password123',
                role: 'Procurement Staff',
                department: 'Procurement',
                status: 'Active'
            },

            // Production Department
            {
                fullName: 'Suresh Rao',
                email: 'project.manager@interiordesign.com',
                phone: '9876543218',
                password: 'password123',
                role: 'Project Manager',
                department: 'Production',
                status: 'Active'
            },
            {
                fullName: 'Kavita Reddy',
                email: 'project.engineer@interiordesign.com',
                phone: '9876543219',
                password: 'password123',
                role: 'Project Engineer',
                department: 'Production',
                status: 'Active'
            },
            {
                fullName: 'Ravi Kumar',
                email: 'site.engineer@interiordesign.com',
                phone: '9876543220',
                password: 'password123',
                role: 'Site Engineer',
                department: 'Production',
                status: 'Active'
            },
            {
                fullName: 'Deepak Nair',
                email: 'site.supervisor@interiordesign.com',
                phone: '9876543221',
                password: 'password123',
                role: 'Site Supervisor',
                department: 'Production',
                status: 'Active'
            },

            // Accounts Department
            {
                fullName: 'Lakshmi Iyer',
                email: 'accounts.manager@interiordesign.com',
                phone: '9876543222',
                password: 'password123',
                role: 'Accounts Manager',
                department: 'Accounts',
                status: 'Active'
            },
            {
                fullName: 'Ganesh Pillai',
                email: 'accounts.staff@interiordesign.com',
                phone: '9876543223',
                password: 'password123',
                role: 'Accounts Staff',
                department: 'Accounts',
                status: 'Active'
            },
            {
                fullName: 'Nirmala Devi',
                email: 'accounts1@interiordesign.com',
                phone: '9876543224',
                password: 'password123',
                role: 'Accounts Staff',
                department: 'Accounts',
                status: 'Active'
            }
        ];

        for (let u of users) {
             u.password = 'admin123';
        }

        /* 
           Removing manual hashing here. The User model's pre-save hook in models/User.js 
           is already configured to hash the password on 'save'.
        */

        const createdUsers = [];
        for (const user of users) {
            // Using .create() ensures pre-save hooks (like password hashing) are triggered
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }

        console.log('✅ Users created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 LOGIN CREDENTIALS FOR ALL DASHBOARDS');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('👑 ADMIN ACCOUNTS');
        console.log('─────────────────────────────────────────────────────────────────────');
        console.log('  Super Admin (Full Access):');
        console.log('    Email:    superadmin@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('  Admin (Full Access):');
        console.log('    Email:    admin@interiordesign.com');
        console.log('    Password: password123\n');

        console.log('🎨 DESIGN DEPARTMENT');
        console.log('─────────────────────────────────────────────────────────────────────');
        console.log('  Design Manager (Design Dashboard):');
        console.log('    Email:    design.manager@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('  Design Staff:');
        console.log('    Email:    design.staff@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('    Email:    designer1@interiordesign.com');
        console.log('    Password: password123\n');

        console.log('📦 PROCUREMENT DEPARTMENT');
        console.log('─────────────────────────────────────────────────────────────────────');
        console.log('  Procurement Manager (Procurement Dashboard):');
        console.log('    Email:    procurement.manager@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('  Procurement Staff:');
        console.log('    Email:    procurement.staff@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('    Email:    procurement1@interiordesign.com');
        console.log('    Password: password123\n');

        console.log('🔧 PRODUCTION DEPARTMENT');
        console.log('─────────────────────────────────────────────────────────────────────');
        console.log('  Project Manager (PM Dashboard → /production-management/dashboard):');
        console.log('    Email:    project.manager@interiordesign.com');
        console.log('    Password: admin123\n');
        console.log('  Project Engineer (Engineer Dashboard → /engineer/dashboard):');
        console.log('    Email:    project.engineer@interiordesign.com');
        console.log('    Password: admin123\n');
        console.log('  Site Engineer:');
        console.log('    Email:    site.engineer@interiordesign.com');
        console.log('    Password: admin123\n');
        console.log('  Site Supervisor:');
        console.log('    Email:    site.supervisor@interiordesign.com');
        console.log('    Password: admin123\n');

        console.log('💰 ACCOUNTS DEPARTMENT');
        console.log('─────────────────────────────────────────────────────────────────────');
        console.log('  Accounts Manager (Accounts Dashboard):');
        console.log('    Email:    accounts.manager@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('  Accounts Staff:');
        console.log('    Email:    accounts.staff@interiordesign.com');
        console.log('    Password: password123\n');
        console.log('    Email:    accounts1@interiordesign.com');
        console.log('    Password: password123\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 DASHBOARD ACCESS GUIDE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('  ROLE                    │ DASHBOARD');
        console.log('  ────────────────────────┼─────────────────────────────────────────');
        console.log('  Super Admin / Admin     │ Admin Panel (All Modules)');
        console.log('  Design Manager          │ Design Manager Dashboard');
        console.log('  Design Staff            │ Designer Dashboard');
        console.log('  Procurement Manager     │ Procurement Manager Dashboard');
        console.log('  Procurement Staff       │ Procurement Staff Dashboard');
        console.log('  Production Manager      │ Production Manager Dashboard');
        console.log('  Production Staff        │ Production Staff Dashboard');
        console.log('  Accounts Manager        │ Accounts Manager Dashboard');
        console.log('  Accounts Staff          │ Accounts Staff Dashboard\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('✅ Database seeded with', createdUsers.length, 'users!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
