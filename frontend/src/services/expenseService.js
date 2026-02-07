import api from './api';

export const expenseService = {
    getAll: (params = {}) => {
        return api.get('/expenses', { params });
    },

    getById: (id) => api.get(`/expenses/${id}`),

    getByDate: (date) => api.get(`/expenses/daily/${date}`),

    create: (data) => api.post('/expenses', data),

    update: (id, data) => api.put(`/expenses/${id}`, data),

    delete: (id) => api.delete(`/expenses/${id}`),
};
