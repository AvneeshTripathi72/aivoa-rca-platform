import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AIWorkflowAPI } from '../services/api';
import { setCurrentInvestigation } from './investigationSlice';

export const checkAIStatus = createAsyncThunk(
  'ai/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AIWorkflowAPI.getStatus();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to check AI status');
    }
  }
);

export const uploadAndProcessDocument = createAsyncThunk(
  'ai/uploadDocument',
  async (formData, { dispatch, rejectWithValue }) => {
    try {
      const response = await AIWorkflowAPI.uploadDocument(formData);
      dispatch(setCurrentInvestigation(response.data.investigation));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Document processing failed');
    }
  }
);

export const processTextIntake = createAsyncThunk(
  'ai/textIntake',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await AIWorkflowAPI.textIntake(payload);
      dispatch(setCurrentInvestigation(response.data.investigation));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Text intake processing failed');
    }
  }
);

export const processEmailIntake = createAsyncThunk(
  'ai/emailIntake',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const response = await AIWorkflowAPI.emailIntake(payload);
      dispatch(setCurrentInvestigation(response.data.investigation));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Email intake processing failed');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    statusInfo: {
      is_configured: false,
      active_model: 'llama-3.3-70b-versatile',
      mode: 'Checking AI status...',
      message: '',
    },
    processing: false,
    processingStage: '',
    executionLog: [],
    lastResult: null,
    error: null,
    intakeMethod: 'upload_pdf', // upload_pdf | pasted_text | email_intake
  },
  reducers: {
    setIntakeMethod: (state, action) => {
      state.intakeMethod = action.payload;
    },
    clearAIState: (state) => {
      state.processing = false;
      state.processingStage = '';
      state.executionLog = [];
      state.error = null;
    },
    addLogMessage: (state, action) => {
      state.executionLog.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // checkAIStatus
      .addCase(checkAIStatus.fulfilled, (state, action) => {
        state.statusInfo = action.payload;
      })
      // uploadAndProcessDocument
      .addCase(uploadAndProcessDocument.pending, (state) => {
        state.processing = true;
        state.error = null;
        state.processingStage = 'Node 1: Extracting text from document...';
      })
      .addCase(uploadAndProcessDocument.fulfilled, (state, action) => {
        state.processing = false;
        state.lastResult = action.payload;
        state.executionLog = action.payload.execution_log || [];
        state.processingStage = 'Completed';
      })
      .addCase(uploadAndProcessDocument.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
        state.processingStage = 'Failed';
      })
      // processTextIntake
      .addCase(processTextIntake.pending, (state) => {
        state.processing = true;
        state.error = null;
        state.processingStage = 'Running LangGraph 10-node AI investigation...';
      })
      .addCase(processTextIntake.fulfilled, (state, action) => {
        state.processing = false;
        state.lastResult = action.payload;
        state.executionLog = action.payload.execution_log || [];
        state.processingStage = 'Completed';
      })
      .addCase(processTextIntake.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
        state.processingStage = 'Failed';
      })
      // processEmailIntake
      .addCase(processEmailIntake.pending, (state) => {
        state.processing = true;
        state.error = null;
        state.processingStage = 'Parsing email headers & executing LangGraph...';
      })
      .addCase(processEmailIntake.fulfilled, (state, action) => {
        state.processing = false;
        state.lastResult = action.payload;
        state.executionLog = action.payload.execution_log || [];
        state.processingStage = 'Completed';
      })
      .addCase(processEmailIntake.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
        state.processingStage = 'Failed';
      });
  },
});

export const { setIntakeMethod, clearAIState, addLogMessage } = aiSlice.actions;
export default aiSlice.reducer;
