import api from './axios';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
};

export const clientService = {
  list: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const cepService = {
  lookup: (zipCode) => api.get(`/cep/${zipCode}`),
};
