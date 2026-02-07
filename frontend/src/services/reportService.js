import api from './api';

export const reportService = {
    getMonthlyReport: (year, month) => {
        return api.get(`/reports/monthly/${year}/${month}`);
    },

    getCategoryReport: (year, month) => {
        return api.get(`/reports/category/${year}/${month}`);
    },

    getMonthComparison: (months) => {
        const params = new URLSearchParams();
        months.forEach(month => params.append('months', month));
        return api.get(`/reports/comparison?${params.toString()}`);
    },

    getYearlyTrends: (year) => {
        return api.get(`/reports/trends/${year}`);
    },
};
