import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import InvestigationsPage from './pages/InvestigationsPage';
import NewInvestigationWorkspacePage from './pages/NewInvestigationWorkspacePage';
import InvestigationWorkspacePage from './pages/InvestigationWorkspacePage';
import EvidenceRegistryPage from './pages/EvidenceRegistryPage';
import CapaMatrixPage from './pages/CapaMatrixPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="investigations" element={<InvestigationsPage />} />
          <Route path="investigations/new" element={<NewInvestigationWorkspacePage />} />
          <Route path="investigations/:id" element={<InvestigationWorkspacePage />} />
          <Route path="evidence" element={<EvidenceRegistryPage />} />
          <Route path="capa" element={<CapaMatrixPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
