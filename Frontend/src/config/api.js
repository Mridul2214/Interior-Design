// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });

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

// Client APIs
export const clientAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/clients?${query}`);
    },

    getById: (id) => apiCall(`/clients/${id}`),

    create: (data) => apiCall('/clients', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/clients/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/clients/stats')
};

// Quotation APIs
export const quotationAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/quotations?${query}`);
    },

    getById: (id) => apiCall(`/quotations/${id}`),

    create: (data) => apiCall('/quotations', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/quotations/${id}`, {
        method: 'DELETE'
    }),

    approve: (id) => apiCall(`/quotations/${id}/approve`, {
        method: 'PUT'
    }),

    getStats: () => apiCall('/quotations/stats')
};

// Inventory APIs
export const inventoryAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/inventory?${query}`);
    },

    getById: (id) => apiCall(`/inventory/${id}`),

    create: (data) => apiCall('/inventory', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/inventory/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/inventory/stats')
};

// Purchase Order APIs
export const purchaseOrderAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/purchase-orders?${query}`);
    },

    getById: (id) => apiCall(`/purchase-orders/${id}`),

    create: (data) => apiCall('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/purchase-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/purchase-orders/${id}`, {
        method: 'DELETE'
    }),

    approve: (id) => apiCall(`/purchase-orders/${id}/approve`, {
        method: 'PUT'
    }),

    markReceived: (id) => apiCall(`/purchase-orders/${id}/receive`, {
        method: 'PUT'
    }),

    getStats: () => apiCall('/purchase-orders/stats')
};

// PO Inventory APIs
export const poInventoryAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/po-inventory?${query}`);
    },

    getById: (id) => apiCall(`/po-inventory/${id}`),

    create: (data) => apiCall('/po-inventory', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/po-inventory/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/po-inventory/${id}`, {
        method: 'DELETE'
    })
};

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

    delete: (id) => apiCall(`/tasks/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/tasks/stats')
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

// Invoice APIs
export const invoiceAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/invoices?${query}`);
    },

    getById: (id) => apiCall(`/invoices/${id}`),

    create: (data) => apiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/invoices/${id}`, {
        method: 'DELETE'
    }),

    recordPayment: (id, data) => apiCall(`/invoices/${id}/payment`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getStats: () => apiCall('/invoices/stats')
};

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

// Report APIs
export const reportAPI = {
    getDashboard: () => apiCall('/reports/dashboard'),
    getRevenue: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/reports/revenue?${query}`);
    },
    getQuotations: () => apiCall('/reports/quotations'),
    getInventory: () => apiCall('/reports/inventory')
};

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
    })
};

// AI APIs
export const aiAPI = {
    query: (prompt, currentPath, pageState) => apiCall('/ai/query', {
        method: 'POST',
        body: JSON.stringify({ prompt, currentPath, pageState })
    }),

    getSuggestion: (type, field, value) => apiCall('/ai/suggest', {
        method: 'POST',
        body: JSON.stringify({ type, field, value })
    })
};

// Upload API

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

export default {
    auth: authAPI,
    clients: clientAPI,
    quotations: quotationAPI,
    inventory: inventoryAPI,
    purchaseOrders: purchaseOrderAPI,
    poInventory: poInventoryAPI,
    tasks: taskAPI,
    teams: teamAPI,
    invoices: invoiceAPI,
    users: userAPI,
    reports: reportAPI,
    notifications: notificationAPI,
    ai: aiAPI
};
