const mongoose = require('mongoose');
require('dotenv').config();
const ProductionProject = require('./models/ProductionProject');
const ProductionTask = require('./models/ProductionTask');
const ProductionActivityLog = require('./models/ProductionActivityLog');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB for seeding...');

        // Clear existing just in case
        await ProductionProject.deleteMany({});
        await ProductionTask.deleteMany({});
        await ProductionActivityLog.deleteMany({});

        const pmId = '69eef50b3c433ec5aa769ad0';
        const peId = '69eef5ff3c433ec5aa769b21';
        const seId = '69eef6773c433ec5aa769b4e';
        const ssId = '69eef6db3c433ec5aa769b72';

        const adminId = '6921319728cb1748259b3bb8'; // An admin

        // Create Projects
        const projects = await ProductionProject.create([
            {
                projectName: 'Villa Renovation - Jubilee Hills',
                description: 'Complete interior renovation',
                status: 'Active',
                progress: 72,
                startDate: new Date(),
                endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                projectManager: pmId,
                createdBy: adminId,
                projectEngineer: peId,
                siteEngineer: seId,
                siteSupervisor: ssId
            },
            {
                projectName: 'Office Interior - HITEC City',
                description: 'Corporate office setup',
                status: 'Active',
                progress: 45,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                projectManager: pmId,
                createdBy: adminId,
                projectEngineer: peId,
                siteEngineer: seId
            },
            {
                projectName: 'Residential Complex - Gachibowli',
                description: 'Model flat interiors',
                status: 'On Hold',
                progress: 28,
                startDate: new Date(),
                endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
                projectManager: pmId,
                createdBy: adminId,
                projectEngineer: peId,
                siteSupervisor: ssId
            }
        ]);

        console.log(`Seeded ${projects.length} projects`);

        // Create Tasks
        const tasks = await ProductionTask.create([
            {
                title: 'Electrical wiring - Phase 2',
                description: 'Complete wiring for first floor',
                projectId: projects[0]._id,
                assignedBy: pmId,
                assignedTo: seId,
                stage: 'SE',
                priority: 'High',
                status: 'Completed',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Daily Site Progress',
                description: 'Upload progress report',
                projectId: projects[1]._id,
                assignedBy: pmId,
                assignedTo: peId,
                stage: 'PE',
                priority: 'Medium',
                status: 'Pending',
                dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Material delay review',
                description: 'Review flooring material delay',
                projectId: projects[2]._id,
                assignedBy: pmId,
                assignedTo: ssId,
                stage: 'SS',
                priority: 'Urgent',
                status: 'In Progress',
                dueDate: new Date()
            }
        ]);

        console.log(`Seeded ${tasks.length} tasks`);

        // Create Activity Log
        await ProductionActivityLog.create([
            {
                projectId: projects[0]._id,
                userId: seId,
                action: 'COMPLETED_TASK',
                message: 'Completed Electrical wiring - Phase 2'
            },
            {
                projectId: projects[1]._id,
                userId: peId,
                action: 'CREATE_TASK',
                message: 'Uploaded Daily Site Progress'
            },
            {
                projectId: projects[2]._id,
                userId: pmId,
                action: 'UPDATE_PROJECT',
                message: 'Project moved to On Hold due to material delay'
            }
        ]);

        console.log('Seeded activity logs');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
