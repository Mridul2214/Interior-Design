import { apiCall } from './apiClient';

// Client APIs
export const clientAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/clients?${query}`);
    },

    getById: (id) => apiCall(`/clients/${id}`),

    create: (data) => apiCall('/clients', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/clients/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/clients/stats')
};
