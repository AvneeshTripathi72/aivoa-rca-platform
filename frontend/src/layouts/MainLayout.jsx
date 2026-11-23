import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { AlertCircle, X, Sparkles, Key } from 'lucide-react';

export default function MainLayout() {
  const { statusInfo } = useSelector((state) => state.ai);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-txt-primary">
      <Header />
      
      {/* Labelled Demo Mode Alert Banner */}
      {!statusInfo?.is_configured && !bannerDismissed && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-950">DEMO MODE ACTIVE:</strong> Groq API key is not configured in backend <code className="bg-amber-100 px-1 py-0.5 rounded text-[11px]">.env</code>. Running with the built-in <strong>Pharmaceutical Domain Synthetic Engine</strong>. Real LangGraph state orchestration and database persistence are active. All AI hypotheses are explicitly labelled.
            </span>
          </div>
          <button 
            onClick={() => setBannerDismissed(true)}
            className="text-amber-700 hover:text-amber-950 p-1 transition"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
