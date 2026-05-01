import { API_BASE_URL } from './apiClient';
import { apiCall } from './apiClient';

// Upload API
export const uploadAPI = {
    image: (formData) => {
        const token = localStorage.getItem('token');
        return fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Don't set Content-Type, browser will set it with boundary
            }
        }).then(res => res.json());
    }
};

// Kanban APIs
export const kanbanAPI = {
    getTasks: () => apiCall('/kanban-tasks'),
    createTask: (data) => apiCall('/kanban-tasks', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateTask: (id, data) => apiCall(`/kanban-tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),
    deleteTask: (id) => apiCall(`/kanban-tasks/${id}`, {
        method: 'DELETE'
    })
};

// Approval APIs
export const approvalAPI = {
    getApprovals: () => apiCall('/approvals'),
    createApproval: (data) => apiCall('/approvals', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    updateApproval: (id, data) => apiCall(`/approvals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),
    deleteApproval: (id) => apiCall(`/approvals/${id}`, {
        method: 'DELETE'
    })
};
