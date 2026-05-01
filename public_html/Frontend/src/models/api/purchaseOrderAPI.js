import { apiCall } from './apiClient';

// Purchase Order APIs
export const purchaseOrderAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/purchase-orders?${query}`);
    },

    getById: (id) => apiCall(`/purchase-orders/${id}`),

    create: (data) => apiCall('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/purchase-orders/${id}`, {
        method: 'DELETE'
    }),

    approve: (id) => apiCall(`/purchase-orders/${id}/approve`, {
        method: 'PUT'
    }),

    markReceived: (id) => apiCall(`/purchase-orders/${id}/receive`, {
        method: 'PUT'
    }),

    getStats: () => apiCall('/purchase-orders/stats')
};

// PO Inventory APIs
export const poInventoryAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/po-inventory?${query}`);
    },

    getById: (id) => apiCall(`/po-inventory/${id}`),

    create: (data) => apiCall('/po-inventory', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/po-inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/po-inventory/${id}`, {
        method: 'DELETE'
    })
};
