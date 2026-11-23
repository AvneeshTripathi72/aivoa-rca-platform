import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { fetchDashboardMetrics } from '../redux/dashboardSlice';
import {
  FileText,
  AlertOctagon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  Layers,
  Activity as ActivityIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { metrics, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const kpis = [
    {
      label: 'Total Investigations',
      value: metrics.total_investigations,
      icon: FileText,
      color: 'text-navy-800',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      label: 'Open Investigations',
      value: metrics.open_investigations,
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50/60',
      border: 'border-blue-200',
    },
    {
      label: 'Under Review',
      value: metrics.under_review_investigations,
      icon: ActivityIcon,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      label: 'Completed / Closed',
      value: metrics.completed_investigations,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'High-Risk Excursions',
      value: metrics.high_risk_investigations,
      icon: AlertOctagon,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
    {
      label: 'Pending CAPA Actions',
      value: metrics.pending_capa_actions,
      icon: ClipboardList,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
  ];

  // Prepare chart data
  const statusData = Object.entries(metrics.status_distribution || {}).map(([key, count]) => ({
    name: key,
    count: count,
  }));

  const riskData = Object.entries(metrics.risk_distribution || {}).map(([key, count]) => ({
    name: key,
    value: count,
  }));

  const RISK_COLORS = {
    Minor: '#3B82F6',
    Major: '#D97706',
    Critical: '#DC2626',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Root Cause Analysis Platform</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">API Quality Investigation Center</h1>
          <p className="text-slate-300 text-xs mt-1 max-w-2xl">
            Orchestrating ICH Q7/Q9 incident intake, 5 Whys causal sequences, 6M Fishbone diagrams, and verified CAPA workflows with human QA validation.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => window.open('/api/demo/download-sample-pdf', '_blank')}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition"
          >
            <FileDown className="w-4 h-4 text-blue-300" />
            <span>Download Sample PDF</span>
          </button>
          <button
            onClick={() => navigate('/investigations/new')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start New RCA</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border ${kpi.border} p-3.5 shadow-2xs flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 line-clamp-1">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold text-slate-900">
                  {loading ? '—' : kpi.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Investigation Lifecycle Status</h3>
              <p className="text-xs text-slate-500">Live distribution across investigation stages</p>
            </div>
            <Link to="/investigations" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-56 w-full">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active investigation data
              </div>
            )}
          </div>
        </div>

        {/* Severity / Risk Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Risk Severity Breakdown</h3>
            <p className="text-xs text-slate-500">ICH Q9 Risk Categorization</p>
          </div>
          <div className="h-44 w-full">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No severity records
              </div>
            )}
          </div>
          <div className="flex justify-center space-x-4 text-xs mt-2">
            {['Critical', 'Major', 'Minor'].map((sev) => (
              <div key={sev} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: RISK_COLORS[sev] }} />
                <span className="text-slate-600 text-[11px] font-medium">{sev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline & Demo Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Quality Activity Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <ActivityIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Audit Trail & Quality Activity Timeline</h3>
            </div>
            <span className="text-[11px] text-slate-400">ALCOA+ Traceable</span>
          </div>

          <div className="space-y-3">
            {metrics.recent_activities && metrics.recent_activities.length > 0 ? (
              metrics.recent_activities.slice(0, 5).map((act, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900">{act.description}</p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{act.performed_by}</span>
                      <span>•</span>
                      <span>{new Date(act.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No recent activity logged.
              </div>
            )}
          </div>
        </div>

        {/* Demo Scenario Highlight Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Pharmaceutical Hiring Challenge</span>
            </div>
            <h4 className="font-bold text-sm text-navy-900">Featured Synthetic Scenario</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              <strong>Incident:</strong> Unexpected Increase in Related Substance B Impurity (0.38% vs. 0.25% limit) in Batch API-BT-2026-014 during crystallization.
            </p>
            <div className="mt-3 bg-white/80 rounded-lg p-2.5 border border-blue-200/60 text-[11px] text-slate-700 space-y-1">
              <div><strong>API:</strong> Atorvastatin Calcium Trihydrate</div>
              <div><strong>Vessel:</strong> CR-402 (10,000L Crystallizer)</div>
              <div><strong>Failure Mode:</strong> Valve CV-402 actuator sticking</div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Ready to test?</span>
            <button
              onClick={() => navigate('/investigations/new')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1"
            >
              <span>Load in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
