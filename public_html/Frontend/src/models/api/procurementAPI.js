import { apiCall } from './apiClient';

// Procurement APIs
export const procurementAPI = {
    getMaterialRequests: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/material-requests?${query}`);
    },

    createMaterialRequest: (data) => apiCall('/procurement/material-requests', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateMaterialRequest: (id, data) => apiCall(`/procurement/material-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    assignStaff: (id, staffId) => apiCall(`/procurement/material-requests/${id}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ staffId })
    }),

    requestTimeExtension: (id, data) => apiCall(`/procurement/material-requests/${id}/time-extension`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    respondTimeExtension: (id, data) => apiCall(`/procurement/material-requests/${id}/time-extension`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getVendorComparisons: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/vendor-comparisons?${query}`);
    },

    createVendorComparison: (data) => apiCall('/procurement/vendor-comparisons', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    selectVendor: (id, data) => apiCall(`/procurement/vendor-comparisons/${id}/select-vendor`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    createPOFromComparison: (id) => apiCall(`/procurement/vendor-comparisons/${id}/create-po`, {
        method: 'POST'
    }),

    getStats: () => apiCall('/procurement/stats'),

    getStaffTasks: () => apiCall('/procurement/staff-tasks'),

    getProcurementStaff: () => apiCall('/procurement/staff'),

    createVendorPurchase: (data) => apiCall('/procurement/vendor-purchases', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getVendorPurchaseHistory: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/vendor-purchases?${query}`);
    },

    compareVendorPrices: (items) => apiCall('/procurement/vendor-purchases/compare', {
        method: 'POST',
        body: JSON.stringify({ items })
    }),

    updatePurchaseStatus: (id, data) => apiCall(`/procurement/vendor-purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    approveMaterialRequest: (id, data = {}) => apiCall(`/procurement/material-requests/${id}/approve-release`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getProductionManagers: () => apiCall('/procurement/production-managers'),

    adminApproveProcurement: (id, data) => apiCall(`/procurement/admin-approve/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};
