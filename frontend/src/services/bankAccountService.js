import api from './api';

export const bankAccountService = {
    getAll: () => api.get('/bank-accounts'),

    getById: (id) => api.get(`/bank-accounts/${id}`),

    create: (data) => api.post('/bank-accounts', data),

    update: (id, data) => api.put(`/bank-accounts/${id}`, data),

    delete: (id) => api.delete(`/bank-accounts/${id}`),

    getBalance: (id) => api.get(`/bank-accounts/${id}/balance`),

    updateBalance: (id, balance) => api.put(`/bank-accounts/${id}/balance`, { balance }),
};
