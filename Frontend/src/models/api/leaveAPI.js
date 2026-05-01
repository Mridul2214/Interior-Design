import { apiCall } from './apiClient';

// Leave APIs
export const leaveAPI = {
    submitLeave: (data) => apiCall('/leaves', {
        method: 'POST',
        body: JSON.stringify(data)
    }),
    getMyLeaves: () => apiCall('/leaves/my-leaves'),
    getPendingLeaves: () => apiCall('/leaves/pending'),
    updateLeaveStatus: (id, statusData) => apiCall(`/leaves/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
    })
};
