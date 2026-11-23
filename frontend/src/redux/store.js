import { configureStore } from '@reduxjs/toolkit';
import investigationReducer from './investigationSlice';
import aiReducer from './aiSlice';
import dashboardReducer from './dashboardSlice';

export const store = configureStore({
  reducer: {
    investigations: investigationReducer,
    ai: aiReducer,
    dashboard: dashboardReducer,
  },
});

export default store;
