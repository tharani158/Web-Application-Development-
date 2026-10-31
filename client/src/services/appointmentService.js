import api from './api';

export const fetchAppointments = (params = {}) => api.get('/appointments', { params });
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);
export const rateAppointment = (id, data) => api.post(`/appointments/${id}/rating`, data);
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);
