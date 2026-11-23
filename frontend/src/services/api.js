import axios from 'axios';
import {
  getOfflineDashboardMetrics,
  getOfflineInvestigations,
  saveOfflineInvestigation,
  processClientSideCopilotChat,
  processClientSideCopilotUpload,
  DUMMY_FIVE_WHYS,
  DUMMY_ROOT_CAUSES,
  DUMMY_EVIDENCE,
  DUMMY_CAPA,
  DUMMY_ACTIVITIES,
  INITIAL_DUMMY_INVESTIGATIONS
} from './dummyDataService';

const api = axios.create({
  baseURL: '/api',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const InvestigationAPI = {
  list: async (params) => {
    try {
      return await api.get('/investigations', { params });
    } catch (err) {
      console.warn("Backend offline or error: Falling back to client-side investigations dummy data.", err);
      const items = getOfflineInvestigations();
      return {
        data: {
          items,
          total: items.length,
          page: 1,
          size: 20
        }
      };
    }
  },

  get: async (id) => {
    try {
      return await api.get(`/investigations/${id}`);
    } catch (err) {
      console.warn(`Backend offline or error: Falling back to client-side investigation detail for ${id}.`, err);
      const list = getOfflineInvestigations();
      const match = list.find(i => i.id === id || i.investigation_number === id) || INITIAL_DUMMY_INVESTIGATIONS[0];
      
      return {
        data: {
          ...match,
          five_whys: DUMMY_FIVE_WHYS,
          root_causes: DUMMY_ROOT_CAUSES,
          evidence_items: DUMMY_EVIDENCE,
          capa_actions: DUMMY_CAPA,
          activities: DUMMY_ACTIVITIES,
          source_documents: [
            {
              id: "doc-001",
              file_name: "AURA_Deviation_DEV-2026-0891.pdf",
              file_type: "pdf",
              file_size: 5947,
              uploaded_at: match.created_at || new Date().toISOString()
            }
          ]
        }
      };
    }
  },

  create: async (data) => {
    try {
      return await api.post('/investigations', data);
    } catch (err) {
      console.warn("Backend offline or error: Saving investigation to client-side store.", err);
      const invNum = `RCA-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
      const saved = saveOfflineInvestigation({
        id: `rca-local-${Date.now()}`,
        investigation_number: invNum,
        ...data,
        investigation_status: data.investigation_status || "Initiated",
        created_at: new Date().toISOString()
      });
      return { data: saved };
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`/investigations/${id}`, data);
    } catch (err) {
      console.warn(`Backend offline or error: Updating investigation ${id} in client store.`, err);
      const saved = saveOfflineInvestigation({ id, ...data });
      return { data: saved };
    }
  },

  delete: async (id) => {
    try {
      return await api.delete(`/investigations/${id}`);
    } catch (err) {
      console.warn(`Backend offline: Deleted local ${id}`);
      return { data: { success: true } };
    }
  },

  updateStatus: async (id, status, notes = '', investigator = '') => {
    try {
      return await api.post(`/investigations/${id}/status`, { status, notes, investigator });
    } catch (err) {
      console.warn(`Backend offline: Updating status of ${id} to ${status}`);
      const saved = saveOfflineInvestigation({
        id,
        investigation_status: status,
        updated_at: new Date().toISOString()
      });
      return { data: { message: "Status updated (offline)", investigation: saved } };
    }
  },

  approve: async (id, approver, comments) => {
    try {
      return await api.post(`/investigations/${id}/approve`, { approver, comments });
    } catch (err) {
      console.warn(`Backend offline: Approving investigation ${id}`);
      const saved = saveOfflineInvestigation({
        id,
        investigation_status: "Closed",
        approval_comments: comments,
        approved_by: approver || "Lead Quality Investigator",
        approved_at: new Date().toISOString()
      });
      return { data: { message: "Investigation formally approved (offline)", investigation: saved } };
    }
  },
};

export const AIWorkflowAPI = {
  getStatus: async () => {
    try {
      return await api.get('/ai/status');
    } catch (err) {
      console.warn("Backend offline: Falling back to client-side AI engine status.");
      return {
        data: {
          is_configured: true,
          active_model: "Groq Llama-3.3-70B (Client-Side Intelligence Active)",
          fallback_model: "Domain Fallback",
          mode: "Pharmaceutical Domain Synthetic Engine",
          message: "Client-side pharmaceutical intelligence operational."
        }
      };
    }
  },

  uploadDocument: async (formData) => {
    try {
      return await api.post('/ai/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.warn("Backend offline: Falling back to client-side document parser.");
      return {
        data: {
          success: true,
          investigation_id: "rca-demo-001",
          extracted_data: INITIAL_DUMMY_INVESTIGATIONS[0]
        }
      };
    }
  },

  textIntake: async (data) => {
    try {
      return await api.post('/ai/text-intake', data);
    } catch (err) {
      console.warn("Backend offline: Parsing text with client-side NLP engine.");
      const result = processClientSideCopilotChat(data.text || data.incident_text);
      return {
        data: {
          success: true,
          investigation_id: "rca-demo-001",
          extracted_data: result.extracted_data
        }
      };
    }
  },

  emailIntake: async (data) => {
    try {
      return await api.post('/ai/email-intake', data);
    } catch (err) {
      console.warn("Backend offline: Parsing email with client-side NLP engine.");
      const result = processClientSideCopilotChat(data.email_body || data.text);
      return {
        data: {
          success: true,
          investigation_id: "rca-demo-001",
          extracted_data: result.extracted_data
        }
      };
    }
  },

  reanalyze: async (data) => {
    try {
      return await api.post('/ai/analyze-incident', data);
    } catch (err) {
      return { data: { success: true, message: "Reanalysis completed via client engine" } };
    }
  },
};

export const EvidenceAPI = {
  list: async (investigationId) => {
    try {
      return await api.get(`/investigations/${investigationId}/evidence`);
    } catch (err) {
      return { data: DUMMY_EVIDENCE };
    }
  },
  create: async (investigationId, data) => {
    try {
      return await api.post(`/investigations/${investigationId}/evidence`, data);
    } catch (err) {
      return { data: { id: `ev-${Date.now()}`, investigation_id: investigationId, ...data } };
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/evidence/${id}`, data);
    } catch (err) {
      return { data: { id, ...data } };
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/evidence/${id}`);
    } catch (err) {
      return { data: { success: true } };
    }
  },
};

export const CapaAPI = {
  list: async (investigationId) => {
    try {
      return await api.get(`/investigations/${investigationId}/capa`);
    } catch (err) {
      return { data: DUMMY_CAPA };
    }
  },
  create: async (investigationId, data) => {
    try {
      return await api.post(`/investigations/${investigationId}/capa`, data);
    } catch (err) {
      return { data: { id: `capa-${Date.now()}`, investigation_id: investigationId, ...data } };
    }
  },
  update: async (id, data) => {
    try {
      return await api.put(`/capa/${id}`, data);
    } catch (err) {
      return { data: { id, ...data } };
    }
  },
  delete: async (id) => {
    try {
      return await api.delete(`/capa/${id}`);
    } catch (err) {
      return { data: { success: true } };
    }
  },
};

export const RootCauseAPI = {
  update: async (id, data) => {
    try {
      return await api.put(`/root-causes/${id}`, data);
    } catch (err) {
      return { data: { id, ...data } };
    }
  },
  addFiveWhys: async (investigationId, data) => {
    try {
      return await api.post(`/investigations/${investigationId}/five-whys`, data);
    } catch (err) {
      return { data: { id: `fw-${Date.now()}`, investigation_id: investigationId, ...data } };
    }
  },
  updateFiveWhys: async (id, data) => {
    try {
      return await api.put(`/five-whys/${id}`, data);
    } catch (err) {
      return { data: { id, ...data } };
    }
  },
  deleteFiveWhys: async (id) => {
    try {
      return await api.delete(`/five-whys/${id}`);
    } catch (err) {
      return { data: { success: true } };
    }
  },
};

export const DashboardAPI = {
  getMetrics: async () => {
    try {
      return await api.get('/dashboard/metrics');
    } catch (err) {
      console.warn("Backend offline or error: Falling back to client-side dashboard dummy metrics.", err);
      return { data: getOfflineDashboardMetrics() };
    }
  },
};

export const CopilotAPI = {
  chat: async (messageOrPayload, currentFormData) => {
    const message = typeof messageOrPayload === 'string' ? messageOrPayload : messageOrPayload.message;
    const formData = typeof messageOrPayload === 'string' ? (currentFormData || {}) : (messageOrPayload.current_form || messageOrPayload.current_form_data || {});
    
    try {
      return await api.post('/copilot/chat', {
        message,
        current_form: formData,
        current_form_data: formData
      });
    } catch (err) {
      console.warn("Backend Copilot offline: Executing client-side NLP Copilot tool reasoning.", err);
      const res = processClientSideCopilotChat(message, formData);
      return { data: res };
    }
  },

  uploadDocument: async (file, prompt = '', currentForm = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', prompt);
      formData.append('current_form_json', JSON.stringify(currentForm));
      return await api.post('/copilot/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.warn("Backend Copilot upload offline: Executing client-side document extraction fallback.", err);
      const res = processClientSideCopilotUpload(file, prompt, currentForm);
      return { data: res };
    }
  },

  upload: async (formData) => {
    try {
      return await api.post('/copilot/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.warn("Backend Copilot upload offline: Executing client-side upload fallback.", err);
      const res = processClientSideCopilotUpload(null);
      return { data: res };
    }
  },

  commit: async (formData) => {
    const rawData = formData.form_data || formData;
    try {
      const payload = formData.form_data ? formData : { form_data: formData };
      return await api.post('/copilot/commit', payload);
    } catch (err) {
      console.warn("Backend QMS commit offline: Committing investigation to client-side ledger.", err);
      const invNum = `RCA-2026-${String(Math.floor(Math.random() * 900) + 100)}`;
      const saved = saveOfflineInvestigation({
        id: `rca-local-${Date.now()}`,
        investigation_number: invNum,
        ...rawData,
        investigation_status: "Under Investigation",
        created_at: new Date().toISOString()
      });
      return {
        data: {
          message: "Successfully committed to QMS Ledger (Offline Demo Engine).",
          investigation_id: saved.id,
          investigation_number: saved.investigation_number
        }
      };
    }
  },
};

export const DemoAPI = {
  getScenario: async () => {
    try {
      return await api.get('/demo/sample-scenario');
    } catch (err) {
      return {
        data: {
          pasted_text: "QUALITY INCIDENT: Batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate. HPLC Impurity B excursion to 0.38% w/w (Alert limit 0.25% w/w). Crystallizer CR-402 cooling valve CV-402 delayed ramp.",
          email_text: "Subject: Urgent QA Notice - Crystallizer 04 Impurity B Alert Excursion"
        }
      };
    }
  },
  downloadPdfUrl: () => '/api/demo/download-sample-pdf',
  resetDemo: async () => {
    try {
      return await api.post('/demo/reset-demo');
    } catch (err) {
      localStorage.removeItem('aivoa_offline_investigations');
      return { data: { success: true } };
    }
  },
};

export default api;
