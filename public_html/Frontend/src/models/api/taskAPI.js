import { apiCall } from './apiClient';

// Task APIs
export const taskAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/tasks?${query}`);
    },

    getById: (id) => apiCall(`/tasks/${id}`),

    create: (data) => apiCall('/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    updateProgress: (id, data) => apiCall(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/tasks/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/tasks/stats'),

    getOverdue: () => apiCall('/tasks/overdue'),

    addComment: (id, text) => apiCall(`/tasks/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text })
    }),

    getComments: (id) => apiCall(`/tasks/${id}/comments`),

    getTimeline: (id) => apiCall(`/tasks/${id}/timeline`),

    reassign: (id, assignedTo, reason) => apiCall(`/tasks/${id}/reassign`, {
        method: 'PUT',
        body: JSON.stringify({ assignedTo, reason })
    }),

    submit: (id, data) => apiCall(`/tasks/${id}/submit`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    review: (id, data) => apiCall(`/tasks/${id}/review`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    pushToProcurement: (id) => apiCall(`/tasks/${id}/push-procurement`, {
        method: 'PUT'
    }),
    salesApprove: (id, data) => apiCall(`/tasks/${id}/sales-approve`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    sendToAdmin: (id) => apiCall(`/tasks/${id}/send-to-admin`, {
        method: 'PUT'
    }),
    adminReview: (id, data) => apiCall(`/tasks/${id}/admin-review`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),
    addDailyUpdate: (id, data) => apiCall(`/tasks/${id}/daily-update`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

// Site Visit APIs
export const siteVisitAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/site-visits?${query}`);
    },
    getByTask: (taskId) => apiCall(`/site-visits/task/${taskId}`),
    create: (data) => apiCall('/site-visits', {
        method: 'POST',
        body: JSON.stringify(data)
    })
};
