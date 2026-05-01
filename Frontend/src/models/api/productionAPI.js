import { apiCall } from './apiClient';

// Production APIs
export const productionAPI = {
    getTasks: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/production/tasks?${query}`);
    },

    createTask: (data) => apiCall('/production/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateTask: (id, data) => apiCall(`/production/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    reportIssue: (taskId, data) => apiCall(`/production/tasks/${taskId}/report-issue`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getPipeline: () => apiCall('/production/pipeline'),

    getStats: () => apiCall('/production/stats'),

    // PM Handoff
    getHandoffProjects: () => apiCall('/production-management/projects/handoff'),
    getProductionStaff: () => apiCall('/production-management/projects/staff'),
    acceptHandoff: (id, data) => apiCall(`/production-management/projects/${id}/accept-handoff`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // Staff Replacement
    createReplacementRequest: (projectId, data) => apiCall(`/production-management/projects/${projectId}/replacement-request`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getReplacementRequests: () => apiCall('/production-management/staff-replacement/requests'),
    actionReplacementRequest: (requestId, data) => apiCall(`/production-management/staff-replacement/requests/${requestId}/action`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    getProductionReports: () => apiCall('/production-management/reports')
};

// Production Manager APIs
export const productionManagerAPI = {
    getProjects: (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);
        return apiCall(`/production-management/projects?${queryParams.toString()}`);
    },
    getDashboardOverview: () => apiCall('/production-management/dashboard/overview'),
    getDashboardDeadlines: () => apiCall('/production-management/dashboard/deadlines'),
    getDashboardBudget: () => apiCall('/production-management/dashboard/budget'),
    getTeamOverview: () => apiCall('/production-management/team/all'),
    // Analytics
    getDashboardCharts: () => apiCall('/production-management/dashboard/charts'),
    getBudgetAnalytics: () => apiCall('/production-management/dashboard/budget-analytics'),
    getKPIMetrics: () => apiCall('/production-management/dashboard/kpi'),
    getGanttData: (projectId = 'all') => apiCall(`/production-management/gantt/${projectId}`),
};

// Site Management APIs
export const siteManagementAPI = {
    // Attendance
    submitAttendance: (data) => apiCall('/production-management/site/attendance', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getProjectAttendance: (projectId) => apiCall(`/production-management/site/attendance/${projectId}`),
    
    // Safety
    reportSafetyIssue: (data) => apiCall('/production-management/site/safety', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getProjectSafetyLogs: (projectId) => apiCall(`/production-management/site/safety/${projectId}`),
    updateSafetyLogStatus: (logId, data) => apiCall(`/production-management/site/safety/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),
    
    // Daily Reports
    submitDailyReport: (data) => apiCall('/production-management/site/reports', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getProjectReports: (projectId) => apiCall(`/production-management/site/reports/${projectId}`),

    // Supervisor Reports
    submitSupervisorReport: (data) => apiCall('/production-management/site/supervisor-reports', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getSupervisorReports: (projectId) => apiCall(`/production-management/site/supervisor-reports/${projectId}`)
};
