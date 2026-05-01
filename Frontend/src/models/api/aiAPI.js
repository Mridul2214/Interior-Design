import { apiCall } from './apiClient';

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
