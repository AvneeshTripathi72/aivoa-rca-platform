import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const InvestigationAPI = {
  list: (params) => api.get('/investigations', { params }),
  get: (id) => api.get(`/investigations/${id}`),
  create: (data) => api.post('/investigations', data),
  update: (id, data) => api.put(`/investigations/${id}`, data),
  delete: (id) => api.delete(`/investigations/${id}`),
  updateStatus: (id, status, notes = '', investigator = '') =>
    api.post(`/investigations/${id}/status`, { status, notes, investigator }),
  approve: (id, approver, comments) =>
    api.post(`/investigations/${id}/approve`, { approver, comments }),
};

export const AIWorkflowAPI = {
  getStatus: () => api.get('/ai/status'),
  uploadDocument: (formData) =>
    api.post('/ai/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  textIntake: (data) => api.post('/ai/text-intake', data),
  emailIntake: (data) => api.post('/ai/email-intake', data),
  reanalyze: (data) => api.post('/ai/analyze-incident', data),
};

export const EvidenceAPI = {
  list: (investigationId) => api.get(`/investigations/${investigationId}/evidence`),
  create: (investigationId, data) => api.post(`/investigations/${investigationId}/evidence`, data),
  update: (id, data) => api.put(`/evidence/${id}`, data),
  delete: (id) => api.delete(`/evidence/${id}`),
};

export const CapaAPI = {
  list: (investigationId) => api.get(`/investigations/${investigationId}/capa`),
  create: (investigationId, data) => api.post(`/investigations/${investigationId}/capa`, data),
  update: (id, data) => api.put(`/capa/${id}`, data),
  delete: (id) => api.delete(`/capa/${id}`),
};

export const RootCauseAPI = {
  update: (id, data) => api.put(`/root-causes/${id}`, data),
  addFiveWhys: (investigationId, data) => api.post(`/investigations/${investigationId}/five-whys`, data),
  updateFiveWhys: (id, data) => api.put(`/five-whys/${id}`, data),
  deleteFiveWhys: (id) => api.delete(`/five-whys/${id}`),
};

export const DashboardAPI = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export const CopilotAPI = {
  chat: (messageOrPayload, currentFormData) => {
    if (typeof messageOrPayload === 'string') {
      return api.post('/copilot/chat', {
        message: messageOrPayload,
        current_form: currentFormData || {},
        current_form_data: currentFormData || {}
      });
    }
    return api.post('/copilot/chat', messageOrPayload);
  },
  uploadDocument: (file, prompt = '', currentForm = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);
    formData.append('current_form_json', JSON.stringify(currentForm));
    return api.post('/copilot/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (formData) =>
    api.post('/copilot/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  commit: (formData) => {
    const payload = formData.form_data ? formData : { form_data: formData };
    return api.post('/copilot/commit', payload);
  },
};

export const DemoAPI = {
  getScenario: () => api.get('/demo/sample-scenario'),
  downloadPdfUrl: () => '/api/demo/download-sample-pdf',
  resetDemo: () => api.post('/demo/reset-demo'),
};

export default api;
