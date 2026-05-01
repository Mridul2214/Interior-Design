import { apiCall } from './apiClient';

// Inventory APIs
export const inventoryAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/inventory?${query}`);
    },

    getById: (id) => apiCall(`/inventory/${id}`),

    create: (data) => apiCall('/inventory', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/inventory/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/inventory/stats')
};
