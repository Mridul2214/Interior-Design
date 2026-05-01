import { apiCall } from './apiClient';

// Report APIs
export const reportAPI = {
    getDashboard: () => apiCall('/reports/dashboard'),
    getRevenue: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/reports/revenue?${query}`);
    },
    getQuotations: () => apiCall('/reports/quotations'),
    getInventory: () => apiCall('/reports/inventory')
};

// Settings APIs
export const settingsAPI = {
    get: () => apiCall('/settings'),

    update: (data) => apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};
