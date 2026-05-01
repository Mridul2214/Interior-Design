import { apiCall } from './apiClient';

// Authentication APIs
export const authAPI = {
    login: (credentials) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),

    register: (userData) => apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),

    getCurrentUser: () => apiCall('/auth/me'),

    updateProfile: (data) => apiCall('/auth/updatedetails', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    updatePassword: (data) => apiCall('/auth/updatepassword', {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
