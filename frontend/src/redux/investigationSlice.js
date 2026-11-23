import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InvestigationAPI } from '../services/api';

export const fetchInvestigations = createAsyncThunk(
  'investigations/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await InvestigationAPI.list(params);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch investigations');
    }
  }
);

export const fetchInvestigationById = createAsyncThunk(
  'investigations/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await InvestigationAPI.get(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch investigation');
    }
  }
);

export const updateInvestigationField = createAsyncThunk(
  'investigations/updateField',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await InvestigationAPI.update(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update field');
    }
  }
);

export const updateStatusThunk = createAsyncThunk(
  'investigations/updateStatus',
  async ({ id, status, notes, investigator }, { rejectWithValue }) => {
    try {
      const response = await InvestigationAPI.updateStatus(id, status, notes, investigator);
      return response.data.investigation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to update status');
    }
  }
);

export const approveInvestigationThunk = createAsyncThunk(
  'investigations/approve',
  async ({ id, approver, comments }, { rejectWithValue }) => {
    try {
      const response = await InvestigationAPI.approve(id, approver, comments);
      return response.data.investigation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to approve investigation');
    }
  }
);

const investigationSlice = createSlice({
  name: 'investigations',
  initialState: {
    items: [],
    total: 0,
    currentInvestigation: null,
    loading: false,
    detailLoading: false,
    error: null,
    searchQuery: '',
    statusFilter: 'All',
    severityFilter: 'All',
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSeverityFilter: (state, action) => {
      state.severityFilter = action.payload;
    },
    setCurrentInvestigation: (state, action) => {
      state.currentInvestigation = action.payload;
    },
    updateLocalFormField: (state, action) => {
      const { field, value } = action.payload;
      if (state.currentInvestigation) {
        state.currentInvestigation[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAll
      .addCase(fetchInvestigations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestigations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
      })
      .addCase(fetchInvestigations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchById
      .addCase(fetchInvestigationById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestigationById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentInvestigation = action.payload;
      })
      .addCase(fetchInvestigationById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })
      // updateField & updateStatus
      .addCase(updateInvestigationField.fulfilled, (state, action) => {
        state.currentInvestigation = action.payload;
      })
      .addCase(updateStatusThunk.fulfilled, (state, action) => {
        state.currentInvestigation = action.payload;
      })
      .addCase(approveInvestigationThunk.fulfilled, (state, action) => {
        state.currentInvestigation = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setSeverityFilter,
  setCurrentInvestigation,
  updateLocalFormField,
} = investigationSlice.actions;

export default investigationSlice.reducer;
