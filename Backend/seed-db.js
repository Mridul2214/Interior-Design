const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const users = await User.find({}, 'fullName role');
    console.log(users);
    process.exit(0);
}).catch(console.error);
