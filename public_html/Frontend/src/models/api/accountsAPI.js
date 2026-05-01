import { apiCall } from './apiClient';

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
