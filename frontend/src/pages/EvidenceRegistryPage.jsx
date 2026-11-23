import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestigationAPI } from '../services/api';
import { FolderGit2, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function EvidenceRegistryPage() {
  const navigate = useNavigate();
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch evidence across investigations
    InvestigationAPI.list({ limit: 10 })
      .then(async (res) => {
        const items = res.data.items || [];
        let allEvidence = [];
        for (const inv of items) {
          const detail = await InvestigationAPI.get(inv.id);
          const evs = (detail.data.evidence_items || []).map((e) => ({
            ...e,
            investigation_number: inv.investigation_number,
            batch_number: inv.batch_number,
            inv_id: inv.id,
          }));
          allEvidence = [...allEvidence, ...evs];
        }
        setEvidenceItems(allEvidence);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load evidence', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">GMP Evidence Registry</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Centralized traceable evidence records across API manufacturing investigations.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">Investigation & Batch</th>
              <th className="py-3 px-4">Evidence Title & Type</th>
              <th className="py-3 px-4">Source Reference</th>
              <th className="py-3 px-4">Observation / Finding</th>
              <th className="py-3 px-4">Review Status</th>
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">Loading evidence registry...</td>
              </tr>
            ) : evidenceItems.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400">No evidence items registered yet.</td>
              </tr>
            ) : (
              evidenceItems.map((ev, idx) => (
                <tr key={ev.id || idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-blue-700">{ev.investigation_number}</span>
                    <p className="text-[11px] text-slate-500">{ev.batch_number}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-900">{ev.title}</p>
                    <span className="text-[10px] text-blue-600 font-medium">{ev.evidence_type}</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {ev.source_reference || '—'}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs text-slate-800 leading-relaxed">
                    {ev.observation}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {ev.review_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/investigations/${ev.inv_id}`)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
