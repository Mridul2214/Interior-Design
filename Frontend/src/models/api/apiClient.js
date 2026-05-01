const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_IMAGE_URL = API_BASE_URL.replace('/api', '');

// Helper function to get auth token
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return (token === 'null' || token === 'undefined') ? null : token;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Generic API call function
export const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Force reload to trigger App redirection to login
            window.location.href = '/';
            throw new Error('Unauthorized: Session expired or invalid token');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export { API_BASE_URL };
