// Models — API Layer
// Barrel file re-exporting all API modules for convenient imports

export { apiCall, getAuthHeaders, API_BASE_URL, BASE_IMAGE_URL } from './apiClient';
export { authAPI } from './authAPI';
export { clientAPI } from './clientAPI';
export { quotationAPI } from './quotationAPI';
export { inventoryAPI } from './inventoryAPI';
export { projectAPI } from './projectAPI';
export { taskAPI, siteVisitAPI } from './taskAPI';
export { procurementAPI } from './procurementAPI';
export { productionAPI, productionManagerAPI, siteManagementAPI } from './productionAPI';
export { engineerAPI } from './engineerAPI';
export { purchaseOrderAPI, poInventoryAPI } from './purchaseOrderAPI';
export { staffAPI, teamAPI, teamMemberAPI } from './staffAPI';
export { invoiceAPI } from './invoiceAPI';
export { vendorAPI } from './vendorAPI';
export { userAPI } from './userAPI';
export { notificationAPI } from './notificationAPI';
export { designDashboardAPI } from './designAPI';
export { accountsAPI } from './accountsAPI';
export { reportAPI, settingsAPI } from './reportAPI';
export { aiAPI } from './aiAPI';
export { leaveAPI } from './leaveAPI';
export { checklistAPI } from './checklistAPI';
export { uploadAPI, kanbanAPI, approvalAPI } from './miscAPI';

// Default export for backward compatibility
import { authAPI } from './authAPI';
import { clientAPI } from './clientAPI';
import { quotationAPI } from './quotationAPI';
import { inventoryAPI } from './inventoryAPI';
import { projectAPI } from './projectAPI';
import { taskAPI } from './taskAPI';
import { procurementAPI } from './procurementAPI';
import { productionAPI, productionManagerAPI } from './productionAPI';
import { engineerAPI } from './engineerAPI';
import { purchaseOrderAPI, poInventoryAPI } from './purchaseOrderAPI';
import { staffAPI, teamAPI, teamMemberAPI } from './staffAPI';
import { invoiceAPI } from './invoiceAPI';
import { vendorAPI } from './vendorAPI';
import { userAPI } from './userAPI';
import { notificationAPI } from './notificationAPI';
import { designDashboardAPI } from './designAPI';
import { accountsAPI } from './accountsAPI';
import { reportAPI, settingsAPI } from './reportAPI';
import { aiAPI } from './aiAPI';
import { checklistAPI } from './checklistAPI';
import { kanbanAPI, approvalAPI } from './miscAPI';

export default {
    auth: authAPI,
    clients: clientAPI,
    quotations: quotationAPI,
    inventory: inventoryAPI,
    purchaseOrders: purchaseOrderAPI,
    poInventory: poInventoryAPI,
    tasks: taskAPI,
    teams: teamAPI,
    invoices: invoiceAPI,
    users: userAPI,
    reports: reportAPI,
    notifications: notificationAPI,
    ai: aiAPI,
    staff: staffAPI,
    kanban: kanbanAPI,
    teamMember: teamMemberAPI,
    approvals: approvalAPI,
    settings: settingsAPI,
    projects: projectAPI,
    vendors: vendorAPI,
    procurement: procurementAPI,
    production: productionAPI,
    accounts: accountsAPI,
    checklists: checklistAPI,
    designDashboard: designDashboardAPI,
    engineer: engineerAPI,
    productionManager: productionManagerAPI
};
