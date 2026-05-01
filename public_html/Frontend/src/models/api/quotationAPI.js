import { apiCall } from './apiClient';

// Quotation APIs
export const quotationAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/quotations?${query}`);
    },

    getById: (id) => apiCall(`/quotations/${id}`),

    create: (data) => apiCall('/quotations', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/quotations/${id}`, {
        method: 'DELETE'
    }),

    approve: (id) => apiCall(`/quotations/${id}/approve`, {
        method: 'PUT'
    }),

    getStats: () => apiCall('/quotations/stats'),

    getVersionHistory: (id) => apiCall(`/quotations/${id}/versions`),

    compareVersions: (id, v1, v2) => apiCall(`/quotations/${id}/compare?v1=${v1}&v2=${v2}`),

    calculateTotals: (items, taxRate, discount) => apiCall('/quotations/calculate-totals', {
        method: 'POST',
        body: JSON.stringify({ items, taxRate, discount })
    })
};
