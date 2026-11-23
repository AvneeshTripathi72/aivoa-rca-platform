import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InvestigationAPI, CapaAPI } from '../services/api';
import { ClipboardList, CheckCircle2, ArrowRight } from 'lucide-react';

export default function CapaMatrixPage() {
  const navigate = useNavigate();
  const [capaActions, setCapaActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    InvestigationAPI.list({ limit: 10 })
      .then(async (res) => {
        const items = res.data.items || [];
        let allCapas = [];
        for (const inv of items) {
          const detail = await InvestigationAPI.get(inv.id);
          const cList = (detail.data.capa_actions || []).map((c) => ({
            ...c,
            investigation_number: inv.investigation_number,
            batch_number: inv.batch_number,
            inv_id: inv.id,
          }));
          allCapas = [...allCapas, ...cList];
        }
        setCapaActions(allCapas);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load CAPA items', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">CAPA Action Matrix</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Enterprise Corrective and Preventive Action tracking under ICH Q10 quality governance.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
            <tr>
              <th className="py-3 px-4">CAPA # & Inv</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Action Description</th>
              <th className="py-3 px-4">Assigned Owner</th>
              <th className="py-3 px-4">Due Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">Loading CAPA actions...</td>
              </tr>
            ) : capaActions.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-slate-400">No CAPA actions registered yet.</td>
              </tr>
            ) : (
              capaActions.map((capa, idx) => (
                <tr key={capa.id || idx} className="hover:bg-slate-50/60">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-purple-700">{capa.action_number}</span>
                    <p className="text-[11px] text-slate-500">{capa.investigation_number}</p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      capa.action_type === 'Corrective'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {capa.action_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 max-w-sm text-slate-800 font-medium leading-relaxed">
                    {capa.description}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {capa.owner}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    {capa.due_date || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {capa.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/investigations/${capa.inv_id}`)}
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
