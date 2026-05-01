import { apiCall } from './apiClient';

// Notification APIs
export const notificationAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/notifications?${query}`);
    },

    markAsRead: (id) => apiCall(`/notifications/${id}/read`, {
        method: 'PUT'
    }),

    markAllAsRead: () => apiCall('/notifications/read-all', {
        method: 'PUT'
    }),

    delete: (id) => apiCall(`/notifications/${id}`, {
        method: 'DELETE'
    }),

    create: (data) => apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getUnreadCount: () => apiCall('/notifications/unread-count')
};
