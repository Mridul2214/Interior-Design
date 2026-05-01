import { apiCall } from './apiClient';

// Vendor APIs
export const vendorAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/vendors?${query}`);
    },

    getById: (id) => apiCall(`/vendors/${id}`),

    create: (data) => apiCall('/vendors', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/vendors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/vendors/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/vendors/stats')
};
