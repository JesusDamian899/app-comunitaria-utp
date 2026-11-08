import {ShieldAlert, ArrowRight, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GlobalCrisisBanner = () => {
  const { isCrisisRealActive, openSos, toggleCrisisRealMode } = useApp();

  if (!isCrisisRealActive) return null;

  return (
    <aside
      aria-label="Alerta general de emergencia comunitaria"
      className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg z-30 transition-all border-b border-red-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
          </span>
          <p className="text-xs sm:text-sm font-black tracking-wide leading-tight">
            🚨 ALERTA GENERAL: PROTOCOLO DE EMERGENCIA ACTIVO EN URB. LAS PALMERAS (SECTOR CALLES)
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openSos}
            className="px-3 py-1.5 bg-white text-red-700 hover:bg-red-50 text-xs font-black rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>Ver Centro SOS / Auxilio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={toggleCrisisRealMode}
            title="Finalizar simulación de crisis general"
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-colors cursor-pointer text-[11px] font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desactivar simulación</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
