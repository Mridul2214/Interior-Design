import { apiCall } from './apiClient';

// Checklist APIs
export const checklistAPI = {
    getByProject: (projectId) => apiCall(`/checklists/project/${projectId}`),

    create: (projectId, data) => apiCall(`/checklists/project/${projectId}`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateStep: (projectId, stepId, data) => apiCall(`/checklists/project/${projectId}/step/${stepId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    addStep: (projectId, data) => apiCall(`/checklists/project/${projectId}/step`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    deleteStep: (projectId, stepId) => apiCall(`/checklists/project/${projectId}/step/${stepId}`, {
        method: 'DELETE'
    })
};
