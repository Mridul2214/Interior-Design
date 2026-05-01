import { apiCall } from './apiClient';

// User APIs
export const userAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/users?${query}`);
    },

    getById: (id) => apiCall(`/users/${id}`),

    create: (data) => apiCall('/users', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/users/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/users/stats')
};
