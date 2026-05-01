const mongoose = require('mongoose');
require('dotenv').config();

const checkModels = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const staffSchema = new mongoose.Schema({}, { strict: false });
        const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
        
        const userSchema = new mongoose.Schema({}, { strict: false });
        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const staffs = await Staff.find({});
        console.log(`Total Staff: ${staffs.length}`);
        staffs.forEach(s => console.log(`Staff - Name: ${s.name}, Role: ${s.role}, staffId: ${s.staffId}, Status: ${s.status}`));

        const users = await User.find({ role: 'Design Staff' });
        console.log(`\nTotal Users with role 'Design Staff': ${users.length}`);
        users.forEach(u => console.log(`User - Name: ${u.fullName}, Role: ${u.role}, staffId: ${u.staffId}`));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkModels();
