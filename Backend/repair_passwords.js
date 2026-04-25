const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function repairPasswords() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // We will reset passwords for all departmental users to 'admin123' 
        // to fix the double-hashing corruption.
        const users = await User.find({
            role: { $in: ['Design Manager', 'Design Staff', 'Procurement Manager', 'Procurement Staff', 'Production Manager', 'Production Staff', 'Accounts Manager', 'Accounts Staff'] }
        });

        console.log(`Found ${users.length} users to repair.`);

        for (let user of users) {
            console.log(`Resetting password for: ${user.email} (${user.role})`);
            user.password = 'admin123';
            await user.save();
        }

        console.log('Password repair complete. All departmental users now have password: admin123');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

repairPasswords();
