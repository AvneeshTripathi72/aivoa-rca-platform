import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileSearch, 
  Sparkles, 
  CheckSquare, 
  FolderGit2, 
  Info,
  Layers,
  FileCheck2
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/investigations', label: 'Investigations', icon: FileSearch },
    { to: '/investigations/new', label: 'AI Intake Workspace', icon: Sparkles, badge: 'AI Hub' },
    { to: '/evidence', label: 'Evidence Registry', icon: FolderGit2 },
    { to: '/capa', label: 'CAPA Action Matrix', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-57px)] sticky top-[57px] shadow-sm select-none">
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Core RCA Navigation
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* RCA Methodologies guide pill */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-navy-800 font-semibold">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Supported Methodologies</span>
          </div>
          <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
            <li>5 Whys Causal Chains</li>
            <li>Fishbone / Ishikawa (6M)</li>
            <li>ALCOA+ Traceability</li>
          </ul>
        </div>
      </div>

      {/* Footer Regulatory Context Card */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="flex items-start space-x-2 text-[11px] text-slate-500 leading-tight">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-700">ICH Q7 API Quality Scope</p>
            <p className="text-[10px] mt-0.5 text-slate-500">
              AI investigates and recommends. Qualified Quality Humans review, validate, and approve.
            </p>
          </div>
        </div>
        <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex items-center justify-between">
          <span>Affiliation</span>
          <a 
            href="https://www.kiet.edu/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-semibold text-indigo-600 hover:text-indigo-800 underline transition"
          >
            KIET Group of Institutions
          </a>
        </div>
      </div>
    </aside>
  );
}
