import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DashboardAPI } from '../services/api';

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await DashboardAPI.getMetrics();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch dashboard metrics');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    metrics: {
      total_investigations: 0,
      open_investigations: 0,
      under_review_investigations: 0,
      completed_investigations: 0,
      high_risk_investigations: 0,
      pending_capa_actions: 0,
      overdue_capa_actions: 0,
      status_distribution: {},
      risk_distribution: {},
      severity_distribution: {},
      recent_activities: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
