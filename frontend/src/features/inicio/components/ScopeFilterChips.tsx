import { Building2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const ScopeFilterChips = () => {
  const { scopeFilter, setScopeFilter } = useApp();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      <button
        onClick={() => setScopeFilter('portal')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
          scopeFilter === 'portal'
            ? 'bg-[#172554] text-white border-[#172554]'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Todo el Portal</span>
      </button>

      <button
        onClick={() => setScopeFilter('edificio')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
          scopeFilter === 'edificio'
            ? 'bg-[#172554] text-white border-[#172554]'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Solo Edificio</span>
      </button>

      <button
        onClick={() => setScopeFilter('urbanizacion')}
        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
          scopeFilter === 'urbanizacion'
            ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Building2 className="w-3.5 h-3.5" />
        <span>Urbanización</span>
      </button>
    </div>
  );
};
