import { apiCall } from './apiClient';

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
