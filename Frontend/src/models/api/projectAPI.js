import { apiCall } from './apiClient';

// Project APIs
export const projectAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/projects?${query}`);
    },

    getById: (id) => apiCall(`/projects/${id}`),

    create: (data) => apiCall('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    updateStage: (id, data) => apiCall(`/projects/${id}/stage`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getByStage: (stage) => apiCall(`/projects/stage/${stage}`),

    getStats: () => apiCall('/projects/stats'),

    validateHandoff: (id) => apiCall(`/projects/${id}/handoff/validate`),

    performHandoff: (id) => apiCall(`/projects/${id}/handoff`, {
        method: 'POST'
    }),

    getWorkflowChecklist: (id) => apiCall(`/projects/${id}/workflow-checklist`)
};
