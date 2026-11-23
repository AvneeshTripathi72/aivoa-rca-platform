import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAIStatus } from '../redux/aiSlice';
import { DemoAPI } from '../services/api';
import { 
  ShieldCheck, 
  Sparkles, 
  FileDown, 
  PlusCircle, 
  Activity, 
  AlertTriangle,
  Beaker
} from 'lucide-react';

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { statusInfo } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(checkAIStatus());
  }, [dispatch]);

  const handleDownloadSample = () => {
    window.open('/api/demo/download-sample-pdf', '_blank');
  };

  return (
    <header className="bg-navy-900 border-b border-navy-700 text-white sticky top-0 z-40 px-6 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-white">AIVOA<span className="text-blue-400">.AI</span></span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  RCA Module
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Pharma API Quality Intelligence • ICH Q7/Q9/Q10</p>
            </div>
          </Link>
        </div>

        {/* Center / Engine Status */}
        <div className="hidden md:flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-2 border ${
            statusInfo?.is_configured 
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                statusInfo?.is_configured ? 'bg-emerald-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                statusInfo?.is_configured ? 'bg-emerald-500' : 'bg-amber-500'
              }`}></span>
            </span>
            <span className="truncate max-w-[240px]">
              {statusInfo?.is_configured 
                ? `Groq LLM Active (${statusInfo?.active_model || 'llama-3.3-70b'})`
                : 'Pharma Domain Engine (Synthetic Demo Mode)'}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>ALCOA+ Traceable</span>
          </div>

          <a
            href="https://www.kiet.edu/"
            target="_blank"
            rel="noopener noreferrer"
            title="KIET Group of Institutions"
            className="hidden lg:flex px-2.5 py-1 rounded bg-indigo-950/60 text-indigo-300 hover:text-white hover:bg-indigo-900 text-xs border border-indigo-700/50 items-center space-x-1.5 transition"
          >
            <span>KIET Group of Institutions</span>
          </a>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadSample}
            title="Download authentic synthetic deviation report PDF for testing"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            <span>Sample Incident PDF</span>
          </button>

          <button
            onClick={() => navigate('/investigations/new')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>
    </header>
  );
}
