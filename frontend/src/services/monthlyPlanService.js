import api from './api';

export const monthlyPlanService = {
    getAll: (params = {}) => {
        return api.get('/monthly-plans', { params });
    },

    getById: (id) => api.get(`/monthly-plans/${id}`),

    getByYearMonth: (year, month) => api.get(`/monthly-plans/${year}/${month}`),

    create: (data) => api.post('/monthly-plans', data),

    update: (id, data) => api.put(`/monthly-plans/${id}`, data),

    delete: (id) => api.delete(`/monthly-plans/${id}`),
};
