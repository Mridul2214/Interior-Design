import { apiCall } from './apiClient';

// Design Dashboard APIs
export const designDashboardAPI = {
    getManagerDashboard: () => apiCall('/design/dashboard/manager'),

    getStaffDashboard: () => apiCall('/design/dashboard/staff'),

    getOverdueTasks: () => apiCall('/design/tasks/overdue'),

    getStaffPerformance: () => apiCall('/design/staff/performance')
};
