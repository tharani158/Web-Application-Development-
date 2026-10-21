import api from './api';

export const fetchProviders = () => api.get('/providers');
export const fetchProviderById = (id) => api.get(`/providers/${id}`);
export const createProvider = (data) => api.post('/providers', data);
export const updateProvider = (id, data) => api.put(`/providers/${id}`, data);
export const deleteProvider = (id) => api.delete(`/providers/${id}`);
