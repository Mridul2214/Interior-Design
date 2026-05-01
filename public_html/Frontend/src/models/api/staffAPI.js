import { apiCall } from './apiClient';

// Staff APIs
export const staffAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/staff?${query}`);
    },

    getById: (id) => apiCall(`/staff/${id}`),

    create: (data) => apiCall('/staff', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/staff/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/staff/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/staff/stats'),

    getAnalytics: (id) => apiCall(`/staff/${id}/analytics`),

    getAnalyticsOverview: () => apiCall('/staff/analytics/overview')
};

// Team APIs
export const teamAPI = {
    getAll: () => apiCall('/teams'),

    getById: (id) => apiCall(`/teams/${id}`),

    create: (data) => apiCall('/teams', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/teams/${id}`, {
        method: 'DELETE'
    }),

    addMember: (id, data) => apiCall(`/teams/${id}/members`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    removeMember: (id, userId) => apiCall(`/teams/${id}/members/${userId}`, {
        method: 'DELETE'
    })
};

// Team Member APIs
export const teamMemberAPI = {
    getMembers: () => apiCall('/team'),
    createMember: (data) => apiCall('/team', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateMember: (id, data) => apiCall(`/team/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),
    deleteMember: (id) => apiCall(`/team/${id}`, {
        method: 'DELETE'
    })
};
