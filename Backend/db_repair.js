const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Staff = require('./models/Staff');

const repairDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Repair');

        const users = await User.find({ role: { $in: ['Design Manager', 'Design Staff', 'Procurement Manager', 'Procurement Staff', 'Production Manager', 'Production Staff', 'Accounts Manager', 'Accounts Staff'] } });
        
        let repaired = 0;
        for (let user of users) {
            // Check if staff record exists for this email or name
            let staff = await Staff.findOne({ name: user.fullName });
            
            if (!staff) {
                console.log(`Missing Staff record for User: ${user.fullName} (${user.role}). Creating one...`);
                // Create Staff record
                staff = await Staff.create({
                    name: user.fullName,
                    email: user.email,
                    phone: user.phone || '0000000000',
                    role: user.role,
                    joiningDate: new Date(),
                    status: 'Active',
                    createdBy: user.createdBy || user._id
                });
                console.log(`Created Staff: ${staff.staffId}`);
                repaired++;
            }
            
            // Link back to user if missing
            if (!user.staffId || user.staffId !== staff.staffId) {
                user.staffId = staff.staffId;
                await user.save();
                console.log(`Linked staffId to User: ${user.fullName}`);
            }
        }
        
        console.log(`Repair completed. Fixed ${repaired} records.`);
        process.exit(0);
    } catch (err) {
        console.error('Error repairing DB:', err);
        process.exit(1);
    }
};

repairDB();
