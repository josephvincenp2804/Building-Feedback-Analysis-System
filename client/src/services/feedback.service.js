import api from './api';

export const feedbackService = {
  submit: (data) => api.post('/feedback', data),
  getAll: (params) => api.get('/feedback', { params }),
  delete: (id) => api.delete(`/feedback/${id}`),
  toggleSpam: (id) => api.patch(`/feedback/${id}/spam`),
};

export const analyticsService = {
  getSummary: (params) => api.get('/analytics/summary', { params }),
  getSentiment: (params) => api.get('/analytics/sentiment', { params }),
  getCategories: (params) => api.get('/analytics/categories', { params }),
  getTimeline: (params) => api.get('/analytics/timeline', { params }),
  getRatings: (params) => api.get('/analytics/ratings', { params }),
  exportCSV: (params) => api.get('/analytics/export', { params, responseType: 'blob' }),
};
