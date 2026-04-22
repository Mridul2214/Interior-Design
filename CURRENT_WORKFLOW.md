# 🔄 Project Workflow Guide — Interior Tech

This document outlines the current end-to-end workflow of the **Interior Tech** management system, covering both business operations and the development lifecycle.

---

## 🏗 1. Operational Workflow (Business Logic)

The core purpose of the system is to manage an interior design project from lead to completion. The workflow follows a linear progression:

### Phase 1: Client & Quotation
1.  **Client Onboarding**: Admin adds a new client in the **Clients** section (GSTIN, contact info, address).
2.  **Quotation Creation**: Admin/Designer creates a professional quotation using the **Quotation Builder**.
    *   Add sections (e.g., Living Room, Kitchen).
    *   Search and add items from **Inventory**.
    *   Use **AI Suggestions** for item descriptions.
    *   Generate a PDF for client approval.

### Phase 2: Project Kickoff & Procurement
3.  **Quotation Approval**: Once the client approves, the quotation status is updated to **Approved**.
4.  **Material Procurement**: If materials are needed:
    *   Admin creates a **Purchase Order (PO)** for suppliers.
    *   Once received, Admin marks the PO as **Received**, which automatically updates the **PO Inventory**.

### Phase 3: Task Management & Execution
5.  **Task Assignment**: Admin/Manager goes to the **Tasks Hub** to assign work.
    *   Select a **Staff Member**.
    *   Link the task to a **Client** and an **Approved Quotation**.
    *   Set a **Priority** and **Due Date**.
6.  **Staff Execution (Staff Portal)**:
    *   Staff logs into their dedicated portal.
    *   Views **My Tasks** and updates status to **In Progress**.
    *   Logs **Site Visits** with GPS location and photo evidence (Before/During/After).

### Phase 4: Completion & Invoicing
7.  **Task Completion**: Staff marks the task as **Completed**.
    *   The system automatically calculates the **On-Time Status**.
    *   **Staff Analytics** are updated in real-time (Completion Rate, Efficiency Trend).
8.  **Invoicing**: Admin generates an **Invoice** linked to the approved quotation.
    *   Track payments (Pending → Partial → Paid).
9.  **Project Closure**: View final reports and revenue analytics in the **Admin Dashboard**.

---

## 🧑‍💻 2. Role-Based Workflow

Access and responsibilities are partitioned by roles:

| Role | Key Workflow Responsibilities |
| :--- | :--- |
| **Super Admin / Admin** | Full system control, User management, Financial oversight, Settings. |
| **Manager** | Task assignment, Client relations, Quotation oversight, Staff performance review. |
| **Designer** | Inventory management, Creating detailed quotations, Material selection. |
| **Staff** | Task execution, Updating progress, Site visit logging (photos/location). |

---

## 🛠 3. Technical & Development Workflow

For developers working on the codebase, follow these standards:

### Local Development Setup
1.  **Backend**: `cd Backend && npm run dev` (Runs on port 5000).
2.  **Frontend**: `cd Frontend && npm run dev` (Runs on port 5173).
3.  **Database**: Ensure MongoDB is running and `.env` is configured.

### Data Flow Architecture
*   **Backend**: Modular Express routes ➔ Controllers ➔ Mongoose Models ➔ MongoDB.
*   **Frontend**: React Components ➔ Centralized API Service (`config/api.js`) ➔ Backend Endpoints.
*   **Authentication**: JWT-based. Protected routes use `authMiddleware`.

### Code Standards
*   **Styling**: Use **Vanilla CSS** with the established glassmorphism design system.
*   **State**: Use React `useState` and `useEffect` for component state; `ToastContext` for notifications.
*   **Assets**: All uploaded images are stored in `Backend/uploads` and served statically.

---

## 🤖 4. AI-Enhanced Workflow

Integrated **Google Gemini AI** features to speed up repetitive tasks:
*   **Form Filler**: Use the "AI Suggest" button on Quotations, Tasks, and Inventory forms.
*   **AI Chat**: Use the floating widget for quick queries about project status or data entry assistance.

---

## 📊 5. Monitoring & Success Metrics
The workflow is successful when the **Admin Dashboard** reflects:
*   **High Conversion Rate**: Approved vs. Total Quotations.
*   **Healthy Inventory**: Stock levels above reorder points.
*   **Team Efficiency**: Staff on-time completion rates above 85% (Status: Improving).

---
*Last Updated: March 27, 2026*
