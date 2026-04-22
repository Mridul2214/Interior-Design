const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const authRoutes = require('./routes/authRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const clientRoutes = require('./routes/clientRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const poInventoryRoutes = require('./routes/poInventoryRoutes');
const taskRoutes = require('./routes/taskRoutes');
const teamRoutes = require('./routes/teamRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const accountsRoutes = require('./routes/accountsRoutes');
const procurementRoutes = require('./routes/procurementRoutes');
const productionRoutes = require('./routes/productionRoutes');
const designRoutes = require('./routes/designRoutes');

const aiRoutes = require('./routes/aiRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const staffRoutes = require('./routes/staffRoutes');
const siteVisitRoutes = require('./routes/siteVisitRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/po-inventory', poInventoryRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/procurement', procurementRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/design', designRoutes);

app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/site-visits', siteVisitRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.use(errorHandler);

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

const PORT = process.env.PORT || 5000;

const { checkTaskDeadlines } = require('./utils/notificationHelper');
const Staff = require('./models/Staff');

const migrateStaffIds = async () => {
    try {
        const staffWithoutId = await Staff.find({ $or: [{ staffId: null }, { staffId: { $exists: false } }, { staffId: '' }] });
        if (staffWithoutId.length > 0) {
            console.log(`Migrating ${staffWithoutId.length} staff members without IDs...`);
            for (const staff of staffWithoutId) {
                await staff.save();
            }
            console.log('Staff ID migration complete');
        }
    } catch (err) {
        console.error('Staff ID migration error:', err.message);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`);
    });

    await migrateStaffIds();

    setTimeout(() => {
        checkTaskDeadlines();
        setInterval(checkTaskDeadlines, 60 * 60 * 1000);
        console.log('Task deadline checker started');
    }, 5000);
};
startServer();

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

module.exports = app;
