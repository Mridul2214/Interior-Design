const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BASE_IMAGE_URL = API_BASE_URL.replace('/api', '');

// Helper function to get auth token
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return (token === 'null' || token === 'undefined') ? null : token;
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

    getStats: () => apiCall('/quotations/stats'),

    getVersionHistory: (id) => apiCall(`/quotations/${id}/versions`),

    compareVersions: (id, v1, v2) => apiCall(`/quotations/${id}/compare?v1=${v1}&v2=${v2}`),

    calculateTotals: (items, taxRate, discount) => apiCall('/quotations/calculate-totals', {
        method: 'POST',
        body: JSON.stringify({ items, taxRate, discount })
    })
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
    addDailyUpdate: (id, data) => apiCall(`/tasks/${id}/daily-update`, {
        method: 'POST',
        body: JSON.stringify(data)
    })
};

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
    }),

    getUnreadCount: () => apiCall('/notifications/unread-count')
};

// Design Dashboard APIs
export const designDashboardAPI = {
    getManagerDashboard: () => apiCall('/design/dashboard/manager'),

    getStaffDashboard: () => apiCall('/design/dashboard/staff'),

    getOverdueTasks: () => apiCall('/design/tasks/overdue'),

    getStaffPerformance: () => apiCall('/design/staff/performance')
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

// Settings APIs
export const settingsAPI = {
    get: () => apiCall('/settings'),

    update: (data) => apiCall('/settings', {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

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

// Vendor APIs
export const vendorAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/vendors?${query}`);
    },

    getById: (id) => apiCall(`/vendors/${id}`),

    create: (data) => apiCall('/vendors', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    update: (id, data) => apiCall(`/vendors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    delete: (id) => apiCall(`/vendors/${id}`, {
        method: 'DELETE'
    }),

    getStats: () => apiCall('/vendors/stats')
};

// Procurement APIs
export const procurementAPI = {
    getMaterialRequests: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/material-requests?${query}`);
    },

    createMaterialRequest: (data) => apiCall('/procurement/material-requests', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateMaterialRequest: (id, data) => apiCall(`/procurement/material-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    assignStaff: (id, staffId) => apiCall(`/procurement/material-requests/${id}/assign`, {
        method: 'PUT',
        body: JSON.stringify({ staffId })
    }),

    requestTimeExtension: (id, data) => apiCall(`/procurement/material-requests/${id}/time-extension`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    respondTimeExtension: (id, data) => apiCall(`/procurement/material-requests/${id}/time-extension`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getVendorComparisons: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/vendor-comparisons?${query}`);
    },

    createVendorComparison: (data) => apiCall('/procurement/vendor-comparisons', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    selectVendor: (id, data) => apiCall(`/procurement/vendor-comparisons/${id}/select-vendor`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    createPOFromComparison: (id) => apiCall(`/procurement/vendor-comparisons/${id}/create-po`, {
        method: 'POST'
    }),

    getStats: () => apiCall('/procurement/stats'),

    getStaffTasks: () => apiCall('/procurement/staff-tasks'),

    getProcurementStaff: () => apiCall('/procurement/staff'),

    createVendorPurchase: (data) => apiCall('/procurement/vendor-purchases', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getVendorPurchaseHistory: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/procurement/vendor-purchases?${query}`);
    },

    compareVendorPrices: (items) => apiCall('/procurement/vendor-purchases/compare', {
        method: 'POST',
        body: JSON.stringify({ items })
    }),

    updatePurchaseStatus: (id, data) => apiCall(`/procurement/vendor-purchases/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    approveMaterialRequest: (id, data = {}) => apiCall(`/procurement/material-requests/${id}/approve-release`, {
        method: 'PUT',
        body: JSON.stringify(data)
    })
};

// Production APIs
export const productionAPI = {
    getTasks: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/production/tasks?${query}`);
    },

    createTask: (data) => apiCall('/production/tasks', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateTask: (id, data) => apiCall(`/production/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    reportIssue: (taskId, data) => apiCall(`/production/tasks/${taskId}/report-issue`, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getPipeline: () => apiCall('/production/pipeline'),

    getStats: () => apiCall('/production/stats')
};

// Accounts APIs
export const accountsAPI = {
    getExpenses: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/accounts/expenses?${query}`);
    },

    createExpense: (data) => apiCall('/accounts/expenses', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateExpense: (id, data) => apiCall(`/accounts/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    getPayments: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiCall(`/accounts/payments?${query}`);
    },

    createPayment: (data) => apiCall('/accounts/payments', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    getProjectFinancials: (projectId) => apiCall(`/accounts/project/${projectId}/financials`),

    getStats: () => apiCall('/accounts/stats')
};

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

    ai: aiAPI,
    staff: staffAPI,
    settings: settingsAPI,
    projects: projectAPI,
    vendors: vendorAPI,
    procurement: procurementAPI,
    production: productionAPI,
    accounts: accountsAPI,
    checklists: checklistAPI,
    designDashboard: designDashboardAPI
};
