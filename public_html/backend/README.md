# Interior Design - Backend API

## 🏗️ Project Structure

```
Backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   ├── authController.js    # Authentication & user management
│   ├── clientController.js  # Client CRUD operations
│   ├── quotationController.js
│   ├── inventoryController.js
│   ├── purchaseOrderController.js
│   ├── poInventoryController.js
│   ├── taskController.js
│   ├── teamController.js
│   ├── invoiceController.js
│   ├── userController.js
│   ├── reportController.js
│   └── notificationController.js
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   └── errorHandler.js      # Global error handling
├── models/
│   ├── User.js
│   ├── Client.js
│   ├── Quotation.js
│   ├── Inventory.js
│   ├── PurchaseOrder.js
│   ├── POInventory.js
│   ├── Task.js
│   ├── Team.js
│   ├── Invoice.js
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── quotationRoutes.js
│   ├── inventoryRoutes.js
│   ├── purchaseOrderRoutes.js
│   ├── poInventoryRoutes.js
│   ├── taskRoutes.js
│   ├── teamRoutes.js
│   ├── invoiceRoutes.js
│   ├── userRoutes.js
│   ├── reportRoutes.js
│   └── notificationRoutes.js
├── uploads/                 # File upload directory
├── .env                     # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js               # Main application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd Backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

4. **Run the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update password
- `POST /api/auth/logout` - Logout user

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Quotations
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/:id` - Get single quotation
- `POST /api/quotations` - Create quotation
- `PUT /api/quotations/:id` - Update quotation
- `DELETE /api/quotations/:id` - Delete quotation
- `PUT /api/quotations/:id/approve` - Approve quotation

### Inventory
- `GET /api/inventory` - Get all inventory items
- `GET /api/inventory/:id` - Get single item
- `POST /api/inventory` - Create item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Purchase Orders
- `GET /api/purchase-orders` - Get all POs
- `GET /api/purchase-orders/:id` - Get single PO
- `POST /api/purchase-orders` - Create PO
- `PUT /api/purchase-orders/:id` - Update PO
- `DELETE /api/purchase-orders/:id` - Delete PO
- `PUT /api/purchase-orders/:id/approve` - Approve PO
- `PUT /api/purchase-orders/:id/receive` - Mark as received

### PO Inventory
- `GET /api/po-inventory` - Get all PO inventory
- `GET /api/po-inventory/:id` - Get single item
- `POST /api/po-inventory` - Create item
- `PUT /api/po-inventory/:id` - Update item
- `DELETE /api/po-inventory/:id` - Delete item

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:userId` - Remove team member

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `PUT /api/invoices/:id/payment` - Record payment

### AI Assistant
- `POST /api/ai/query` - Query the AI assistant with system context
- `POST /api/ai/suggest` - Get entity-specific suggestions

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Reports
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/revenue` - Get revenue reports
- `GET /api/reports/quotations` - Get quotation reports
- `GET /api/reports/inventory` - Get inventory reports

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🛡️ Role-Based Access Control

- **Super Admin**: Full access to all features
- **Admin**: Manage users, clients, quotations, inventory
- **Manager**: View and manage assigned projects
- **Designer**: View and update tasks
- **User**: Limited read access

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/interior_design_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:5000/health
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **cors**: Cross-origin resource sharing
- **helmet**: Security headers
- **express-validator**: Input validation
- **multer**: File upload handling
- **morgan**: HTTP request logger
- **compression**: Response compression
- **express-rate-limit**: Rate limiting

## 🚨 Error Handling

All errors return a consistent JSON format:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 📊 Response Format

Success responses:

```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "pagination": { ... }
}
```

## 🔄 Data Relationships

- Quotations → Clients
- Invoices → Clients, Quotations, PurchaseOrders
- Tasks → Users (assignedTo), Teams
- PurchaseOrders → POInventory
- All models → Users (createdBy)

## 🎯 Features

✅ Complete CRUD operations for all entities
✅ JWT-based authentication
✅ Role-based authorization
✅ Input validation
✅ Error handling
✅ File upload support
✅ Pagination & filtering
✅ Search functionality
✅ Auto-numbering (Quotations, POs, Invoices)
✅ Automatic calculations
✅ Status tracking
✅ Audit trails (createdBy, timestamps)

## 📞 Support

For issues or questions, please contact the development team.

---

**Built with ❤️ for Interior Design**
