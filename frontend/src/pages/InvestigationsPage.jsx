import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchInvestigations, 
  setSearchQuery, 
  setStatusFilter, 
  setSeverityFilter 
} from '../redux/investigationSlice';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  ArrowUpRight, 
  Clock, 
  ShieldAlert, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function InvestigationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total, loading, searchQuery, statusFilter, severityFilter } = useSelector(
    (state) => state.investigations
  );

  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    dispatch(
      fetchInvestigations({
        search: searchQuery,
        status: statusFilter,
        severity: severityFilter,
      })
    );
  }, [dispatch, searchQuery, statusFilter, severityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearch));
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Major':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Approval':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Root Cause Review':
      case 'CAPA Review':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Under Investigation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">RCA Investigations Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GMP Quality root cause investigations for Active Pharmaceutical Ingredient (API) deviations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/investigations/new')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New RCA Investigation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Batch, Title, API..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Information Extraction">Information Extraction</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Root Cause Review">Root Cause Review</option>
              <option value="CAPA Review">CAPA Review</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-medium text-slate-500">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => dispatch(setSeverityFilter(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="Major">Major</option>
              <option value="Minor">Minor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Investigation #</th>
                <th className="py-3 px-4">Incident Title & API Product</th>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Stage / Equipment</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Investigator</th>
                <th className="py-3 px-4 text-center">Artefacts</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-slate-400">
                    Loading quality investigations...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <p className="font-semibold text-slate-600">No investigations found.</p>
                    <p className="text-xs mt-1">Try resetting your search query or start a new RCA.</p>
                  </td>
                </tr>
              ) : (
                items.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/investigations/${inv.id}`)}
                    className="hover:bg-blue-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {inv.investigation_number}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate">{inv.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{inv.product_name || 'API Not Assigned'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                      {inv.batch_number || '—'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{inv.manufacturing_stage || '—'}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getSeverityBadge(inv.severity)}`}>
                        {inv.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(inv.investigation_status)}`}>
                        {inv.investigation_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">
                      {inv.investigator}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
                        <span title="Evidence items" className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                          {inv.evidence_count}E
                        </span>
                        <span title="Root causes" className="px-1.5 py-0.5 rounded bg-slate-100 font-mono">
                          {inv.root_cause_count}RC
                        </span>
                        <span title="CAPA actions" className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
                          {inv.capa_count}C
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/investigations/${inv.id}`);
                        }}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
