import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8086/api';

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
};

export const register = async ({ name, email, password }) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    return response.data;
};

export const getCurrentUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const updateProfile = async (data) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
