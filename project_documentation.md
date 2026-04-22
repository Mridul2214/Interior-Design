# 🏠 Interior Tech — Interior Design Management System

> A comprehensive, full-stack web application for managing an interior design business. Built with React.js and Node.js, it features role-based dashboards for Admins and Staff, quotation management, inventory tracking, invoicing, task assignments, AI-powered suggestions, and real-time analytics.

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Project Architecture](#-project-architecture)
4. [Authentication & Login](#-authentication--login)
5. [Admin Panel Features](#-admin-panel-features)
6. [Staff Panel Features](#-staff-panel-features)
7. [AI Integration](#-ai-integration)
8. [Database Models](#-database-models)
9. [API Endpoints](#-api-endpoints)
10. [Screenshots](#-screenshots)

---

## 🏗 Project Overview

**Interior Tech** is an end-to-end business management platform designed specifically for interior design firms. It provides two distinct portals:

- **Admin Panel** — Full business management dashboard for owners, managers, and designers
- **Staff Panel** — A streamlined portal for field staff to manage tasks, site visits, and client interactions

### Key Highlights
- 🔐 Role-based authentication (Super Admin, Admin, Manager, Designer, Staff)
- 📊 Real-time analytics dashboard with revenue charts and KPIs
- 📄 Professional quotation builder with PDF generation
- 📦 Dual inventory system (Product Inventory + Purchase Order Inventory)
- 🧾 Invoice management with payment tracking
- ✅ Task assignment & progress tracking with site visit evidence
- 🤖 AI-powered suggestions using Google Gemini API
- 🔔 Real-time notification system
- 📱 Fully responsive design (Desktop + Mobile)
- 🎨 Premium glassmorphism UI with smooth animations

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React.js 18** | Core UI framework (SPA) |
| **React Router v6** | Client-side routing & navigation |
| **Recharts** | Data visualization (charts, graphs) |
| **Lucide React** | Premium icon library |
| **Lenis** | Smooth scrolling engine |
| **Vanilla CSS** | Custom styling with glassmorphism design |
| **Vite** | Build tool & dev server |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Server runtime |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM (Object Data Modeling) |
| **JWT (jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Multer** | File upload handling |
| **Helmet** | Security headers |
| **CORS** | Cross-origin resource sharing |
| **Morgan** | HTTP request logger |
| **Express Rate Limit** | API rate limiting |
| **Express Validator** | Input validation |
| **@google/generative-ai** | Gemini AI integration |

---

## 🏛 Project Architecture

```
Interior Design/
├── Frontend/
│   └── src/
│       ├── App.jsx                    # Root app with routing
│       ├── main.jsx                   # Entry point
│       ├── config/
│       │   └── api.js                 # Centralized API configuration
│       ├── context/
│       │   └── ToastContext.jsx       # Global toast notifications
│       ├── components/
│       │   ├── Login.jsx              # Unified login page
│       │   ├── AdminPanel/            # 18 components + CSS
│       │   │   ├── Layout.jsx         # Dashboard shell (sidebar + header + content)
│       │   │   ├── Sidebar.jsx        # Navigation sidebar
│       │   │   ├── Header.jsx         # Top bar with notifications
│       │   │   ├── Dashboard.jsx      # Analytics home page
│       │   │   ├── Quotations.jsx     # Quotation list
│       │   │   ├── NewQuotation.jsx   # Quotation builder (1200+ lines)
│       │   │   ├── QuotationView.jsx  # Quotation preview/PDF
│       │   │   ├── Inventory.jsx      # Product inventory
│       │   │   ├── PurchaseOrders.jsx # Purchase order management
│       │   │   ├── POInventory.jsx    # PO inventory tracking
│       │   │   ├── Clients.jsx        # Client management
│       │   │   ├── Staff.jsx          # Staff management + analytics
│       │   │   ├── Tasks.jsx          # Task assignment + site visits
│       │   │   ├── Reports.jsx        # Business analytics
│       │   │   ├── Invoice.jsx        # Invoice & payment tracking
│       │   │   ├── Users.jsx          # User/role management
│       │   │   ├── Settings.jsx       # App settings
│       │   │   └── AIChat.jsx         # Floating AI assistant
│       │   ├── StaffPanel/            # 8 components + CSS
│       │   │   ├── StaffLayout.jsx
│       │   │   ├── StaffSidebar.jsx
│       │   │   ├── StaffHeader.jsx
│       │   │   ├── StaffDashboard.jsx
│       │   │   ├── StaffTasks.jsx
│       │   │   ├── SiteVisit.jsx
│       │   │   ├── StaffClients.jsx
│       │   │   └── StaffQuotations.jsx
│       │   └── common/                # Shared components
│       │       ├── AISuggestButton.jsx
│       │       └── CustomSelect.jsx
│       └── assets/
│
├── Backend/
│   ├── server.js                      # Express app entry point
│   ├── config/
│   │   └── db.js                      # MongoDB connection
│   ├── controllers/                   # 15 controllers
│   ├── models/                        # 12 Mongoose models
│   ├── routes/                        # 16 route files
│   ├── middleware/
│   │   ├── auth.js                    # JWT authentication
│   │   └── ...
│   ├── utils/
│   ├── uploads/                       # Uploaded files storage
│   └── seed.js                        # Database seeder
```

---

## 🔐 Authentication & Login

The application uses a **unified login system** where users can sign in using either their **email address** or **Staff ID** in a single input field. The backend auto-detects the input type and authenticates accordingly.

### Login Page
![Login Page — Interior Tech](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\login_page_1773030555188.png)

### Features:
- **Unified login** — Single field for Email or Staff ID
- **JWT-based authentication** — Secure token with 30-day expiry
- **Password hashing** — Using bcrypt with salt rounds
- **Role-based routing** — Admins → Admin Panel, Staff → Staff Portal
- **Persistent sessions** — Token stored in `localStorage`
- **Guest Access** — Available for demo purposes

### User Roles:
| Role | Access Level |
|---|---|
| Super Admin | Full access to all modules + user management |
| Admin | Full access to all modules |
| Manager | Access to quotations, clients, tasks, reports |
| Designer | Access to quotations, inventory, clients |
| Staff | Staff Portal only (tasks, site visits, clients, quotations) |

---

## 📊 Admin Panel Features

### 1. Dashboard (Home)
The main landing page after login. Provides a bird's-eye view of the entire business.

![Admin Dashboard](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_dashboard_home_1773030665896.png)

**Features:**
- **Analytics Cards** — Quotations count (Pending/Approved), Inventory status (In Stock/Low/Out), Purchase Orders (Pending/Received), Clients (Active/New)
- **Revenue Analytics** — Interactive area chart showing revenue trends over time
- **Revenue Summary** — Total Revenue and Potential Revenue cards
- **Pie Charts** — Visual distribution with custom color schemes
- **Quick Action** — "+ New Quotation" button in the header
- **Notification Bell** — Real-time notification center

---

### 2. Quotations
Create, manage, and track project quotations/estimates with full lifecycle support.

![Quotations Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_quotations_1773030677120.png)

**Features:**
- **Quotation List** — View all quotations with quote number, project name, client, amount, date, and status
- **Status Filters** — Filter by All, Pending, Approved
- **Search** — Full-text search across projects, quotes, and clients
- **Actions** — View (👁), Approve (✅), Edit (✏️), Delete (🗑️)
- **New Quotation Builder** — Professional multi-section quotation form with:
  - Auto-generated quotation numbers (e.g., #QT-2026-159)
  - Client search with auto-fill or quick-add new client
  - Line items with product search from inventory
  - Image upload per line item
  - Section-based organization (e.g., Living Room, Kitchen)
  - Auto-calculated subtotals, taxes, and grand total
  - AI-powered description suggestions
  - Preview mode before saving
  - PDF-ready quotation view

---

### 3. Inventory
Manage the product catalog and track stock levels.

![Inventory Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_inventory_1773030687440.png)

**Features:**
- **Product Grid** — Visual cards showing product image, name, category, price, and stock
- **Add/Edit Products** — Modal form with:
  - Product name, category, description
  - Purchase and selling price
  - Current stock quantity
  - Image upload with preview
  - AI-generated descriptions
- **Search & Filter** — Find products quickly
- **Stock Alerts** — Visual indicators for low stock and out-of-stock items
- **Section-based organizing** — Group inventory by categories

---

### 4. Purchase Orders
Create and track purchase orders to suppliers.

![Purchase Orders Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_purchase_orders_1773030697737.png)

**Features:**
- **PO List** — View all purchase orders with PO number, supplier, item count, total, date, and status
- **Create PO** — Multi-item purchase order form with:
  - Supplier information
  - Line items linked to inventory
  - Quantity and unit price per item
  - Auto-calculated totals
  - AI-powered suggestions for suppliers/items
- **Status Tracking** — Pending → Received workflow
- **Mark as Received** — One-click to mark PO as received and update stock
- **Delete** — Remove purchase orders

---

### 5. PO Inventory
Track inventory received through purchase orders separately.

![PO Inventory Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_po_inventory_1773030707868.png)

**Features:**
- **Inventory Grid** — Cards showing item name, category, stock level, and reorder point
- **Stock Level Indicators** — Color-coded bars (Green = Healthy, Yellow = Low, Red = Critical)
- **Add/Edit Items** — Track items with name, category, current stock, and reorder level
- **Search & Filter** — Quick product lookup
- **Stock Percentage** — Visual progress bars showing current vs reorder level

---

### 6. Clients
Manage the client database and track project relationships.

![Clients Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_clients_1773030719319.png)

**Features:**
- **Client List** — View all clients with name, email, phone, address, and GSTIN
- **Add/Edit Client** — Form with fields for:
  - Full name
  - Email address
  - Phone number
  - Full address
  - GSTIN (tax number)
- **Search** — Find clients by name, email, or phone
- **Edit/Delete** — Manage client records
- **Client Linking** — Clients are linked to quotations, invoices, and tasks

---

### 7. Staff Management
Manage field staff, designers, and team members with performance analytics.

![Staff Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_staff_1773030729362.png)

**Features:**
- **Staff Directory** — Cards showing staff name, role, department, phone, email, join date, and status
- **Add/Edit Staff** — Comprehensive form with:
  - Personal details (name, email, phone)
  - Role and department assignment
  - Status (Active/Inactive)
  - Auto-generated Staff ID
- **Performance Analytics** — View individual staff analytics:
  - Tasks completed vs assigned
  - Site visits logged
  - Performance score
  - Activity timeline
- **Search & Filter** — Find staff by name, role, or department

---

### 8. Tasks Hub
Assign tasks to staff, track progress, and view site visit evidence.

![Tasks Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_tasks_1773030738815.png)

**Features:**
- **Task Overview Cards** — Total Tasks, To Do, In Progress, Completed
- **Task List** — Kanban-style list with task title, assigned staff, client, priority, status, and progress
- **Assign Task** — Form with:
  - Task title and description
  - Assigned staff member
  - Related client
  - Priority level (Low, Medium, High, Urgent)
  - Due date
  - AI-generated task descriptions
- **Progress Tracking** — Percentage-based progress bar (0-100%)
- **Status Updates** — To Do → In Progress → Completed
- **View Details** — Modal showing:
  - Task information
  - Site visit logs with images
  - Location data
  - Staff notes
- **Priority Filters** — Filter by All, Low, Medium, High, Urgent

---

### 9. Analytics Reports
Comprehensive business performance dashboard.

![Reports Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_reports_1773030748605.png)

**Features:**
- **Key Metrics Grid** — 8 KPI cards:
  - Total Revenue
  - Pending Revenue
  - Total Clients
  - Conversion Rate
  - Active Tasks
  - Total Quotations
  - Approved Quotes
  - Inventory Alerts
- **Quote Activity Summary** — Table of recent quotation activity
- **Export PDF** — Download reports as PDF
- **Color-coded cards** — Green (revenue), Blue (pending), Cyan (clients), Orange (conversion), Pink (tasks), Purple (quotes)

---

### 10. Invoice Management
Generate invoices and track payments.

![Invoice Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_invoice_1773030759249.png)

**Features:**
- **Invoice List** — View all invoices with invoice number, client, amount, status, and dates
- **Create Invoice** — Link invoices to approved quotations:
  - Select client
  - Auto-populate from approved quotation
  - Set due date and payment terms
- **Payment Tracking** — Track partial and full payments:
  - Pending → Partially Paid → Paid status flow
  - Record individual payment amounts
- **Actions** — Print, Edit, Delete invoices
- **Status Badges** — Color-coded payment status indicators

---

### 11. User Management
Manage system users and their access roles.

![Users Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_users_1773030770734.png)

**Features:**
- **User List** — View all users with name, email, phone, role, and status
- **Add/Edit User** — Create users with:
  - Full name, email, phone
  - Role assignment (Super Admin, Admin, Manager, Designer, Staff)
  - Password (hashed before storage)
  - Status (Active/Inactive)
- **Role-based badges** — Color-coded role indicators
- **Search** — Filter users by name, email, or role
- **Delete** — Remove user accounts

---

### 12. Notification System
Real-time notification center accessible from the header.

**Features:**
- **Bell Icon** — Unread count badge in the header
- **Notification Panel** — Slide-out panel showing recent notifications
- **Categories** — Quote, Invoice, Task, Inventory, PO, Info, Success, Warning, Error
- **Mark as Read** — Individual or "Mark All Read"
- **Delete** — Remove individual notifications
- **Time Ago** — Relative timestamps (e.g., "2 hours ago")

---

### 13. Collapsible Sidebar
The admin sidebar supports expand/collapse for more workspace.

**Navigation Items:**
Dashboard, Quotations, Inventory, Purchase Orders, PO Inventory, Clients, Staff, Tasks, Reports, Invoice, Users, Settings, Logout

---

## 👷 Staff Panel Features

The Staff Panel is a separate, streamlined portal designed for field staff members.

### Staff Panel Navigation:
- Home (Dashboard)
- My Tasks
- Site Visits
- Clients
- Quotations

### Staff Dashboard
- **Task summary** — Pending, In Progress, Completed counts
- **Recent tasks** — Quick-access to assigned tasks
- **Quick actions** — Navigate to tasks or site visits
- **Recent site visit uploads** — View latest visit evidence

### My Tasks (Staff)
- View only tasks **assigned to them**
- Update task status and progress
- Add notes to tasks

### Site Visits
- **Log site visits** — Record visits to client properties:
  - Select associated task
  - Select client
  - Add location/address
  - Write detailed notes
  - Upload multiple photos (before/after, progress shots)
- **Photo Upload** — Multi-image upload with preview and removal
- **GPS Location** — Track visit location

### Staff Clients
- View client information
- Contact clients directly

### Staff Quotations
- Create and manage quotations within staff scope
- Full quotation builder with same capabilities as admin

---

## 🤖 AI Integration

The application integrates **Google Gemini AI** to assist with content generation.

### AI Features:
1. **AI Suggest Button** — Available on forms for:
   - Task descriptions
   - Inventory item descriptions
   - Purchase order notes
   - Quotation line item descriptions
2. **AI Chat** (Floating Widget) — A conversational AI assistant accessible from any admin page
3. **Context-aware suggestions** — AI considers the form's current data when generating suggestions

### How It Works:
- Uses `@google/generative-ai` package
- Sends context to Gemini API
- Returns smart, relevant suggestions
- One-click to populate form fields

---

## 🗄 Database Models

The application uses **12 MongoDB models**:

| Model | Description |
|---|---|
| **User** | System users with roles, auth credentials, and status |
| **Client** | Client profiles (name, email, phone, address, GSTIN) |
| **Staff** | Staff members with department, role, and Staff ID |
| **Quotation** | Full quotation documents with sections, line items, and totals |
| **Invoice** | Invoices linked to quotations with payment tracking |
| **Inventory** | Product catalog with pricing and stock levels |
| **PurchaseOrder** | Purchase orders with supplier info and item lists |
| **POInventory** | Purchase-order-based inventory tracking |
| **Task** | Task assignments with priority, status, progress, and due dates |
| **SiteVisit** | Site visit logs with location, notes, and photo evidence |
| **Team** | Team/department groupings |
| **Notification** | System notifications with types and read status |

---

## 🔗 API Endpoints

The backend exposes **16 route groups** with RESTful endpoints:

| Route Group | Base Path | Key Operations |
|---|---|---|
| **Auth** | `/api/auth` | Login, Register, Profile, Change Password |
| **Users** | `/api/users` | CRUD for system users |
| **Clients** | `/api/clients` | CRUD for clients |
| **Staff** | `/api/staff` | CRUD + analytics for staff members |
| **Quotations** | `/api/quotations` | CRUD + approve/reject quotations |
| **Inventory** | `/api/inventory` | CRUD for products + stock management |
| **Purchase Orders** | `/api/purchase-orders` | CRUD + mark received |
| **PO Inventory** | `/api/po-inventory` | CRUD for PO-based inventory |
| **Tasks** | `/api/tasks` | CRUD + status/progress updates |
| **Site Visits** | `/api/site-visits` | CRUD for site visit logs |
| **Invoices** | `/api/invoices` | CRUD + payment updates |
| **Reports** | `/api/reports` | Dashboard analytics & KPIs |
| **Notifications** | `/api/notifications` | CRUD + mark read/unread |
| **Teams** | `/api/teams` | CRUD for team groups |
| **Uploads** | `/api/upload` | File upload (images, documents) |
| **AI** | `/api/ai` | AI suggestion endpoints |

### Security:
- All routes (except login) are protected with **JWT middleware**
- **Rate limiting** on API endpoints
- **Helmet** for HTTP security headers
- **CORS** configured for frontend origin
- **Input validation** via express-validator

---

## 📸 Screenshots

### Login Page
![Login Page](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\login_page_1773030555188.png)

### Admin Dashboard
````carousel
![Dashboard — Business overview with analytics cards and revenue chart](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_dashboard_home_1773030665896.png)
<!-- slide -->
![Quotations — List of project estimates with status tracking](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_quotations_1773030677120.png)
<!-- slide -->
![Inventory — Product catalog with stock management](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_inventory_1773030687440.png)
<!-- slide -->
![Purchase Orders — Supplier order management](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_purchase_orders_1773030697737.png)
<!-- slide -->
![PO Inventory — Purchase-order-based stock tracking](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_po_inventory_1773030707868.png)
<!-- slide -->
![Clients — Client database management](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_clients_1773030719319.png)
<!-- slide -->
![Staff — Staff directory with performance analytics](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_staff_1773030729362.png)
<!-- slide -->
![Tasks Hub — Task assignment and progress tracking](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_tasks_1773030738815.png)
<!-- slide -->
![Reports — Business analytics and KPIs](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_reports_1773030748605.png)
<!-- slide -->
![Invoice — Invoice generation and payment tracking](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_invoice_1773030759249.png)
<!-- slide -->
![Users — User and role management](C:\Users\mridu\.gemini\antigravity\brain\64d2bb43-a515-4c56-a1f8-95d9aa9e1e9e\admin_users_1773030770734.png)
````

---

## 🚀 Deployment

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Environment Variables (Backend `.env`)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/interior_design_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
CORS_ORIGIN=https://your-frontend-domain.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
GEMINI_API_KEY=your_gemini_api_key
```

### Quick Start
```bash
# Backend
cd Backend
npm install
npm start

# Frontend
cd Frontend
npm install
npm run dev
```

---

*Document generated on March 9, 2026*
