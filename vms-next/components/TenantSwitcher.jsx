'use client';

import { Building2, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function TenantSwitcher({ role, tenants, activeTenant, onSwitch }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (role !== 'superadmin') {
    const current = tenants?.find(t => t.id === activeTenant);
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <Building2 size={18} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Active Facility</p>
          <p className="text-sm font-bold text-slate-700 leading-none">{current?.name || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  const activeData = tenants?.find(t => t.id === activeTenant) || { name: 'All Tenants', id: 'ALL' };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <Building2 size={18} />
        </div>
        <div className="text-left hidden md:block">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1">Switch View</p>
          <p className="text-sm font-bold text-slate-700 leading-none">{activeData.name}</p>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => { onSwitch('ALL'); setIsOpen(false); }}
            className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-3 ${activeTenant === 'ALL' ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
          >
            <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
            All Tenants
          </button>
          <div className="h-px bg-slate-100 my-1 mx-4"></div>
          <div className="max-h-64 overflow-y-auto">
            {tenants?.map(t => (
              <button 
                key={t.id}
                onClick={() => { onSwitch(t.id); setIsOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-3 ${activeTenant === t.id ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-600'}`}
              >
                <div className={`w-2 h-2 rounded-full ${activeTenant === t.id ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
