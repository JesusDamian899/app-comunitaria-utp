import { ArrowLeft, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IndividualEmergencyView } from './components/IndividualEmergencyView';
import { CrisisRealBienestarView } from './components/CrisisRealBienestarView';

export const SosScreen = () => {
  const { closeSos, isCrisisRealActive, setIsCrisisRealActive } = useApp();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden pb-8 animate-in fade-in duration-200">
      {/* Encabezado SOS */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 sm:px-6 py-3.5 border-b border-slate-100 shadow-xs">
        <button
          type="button"
          onClick={closeSos}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
          <span>Volver al aplicativo</span>
        </button>

        {/* Indicador de Centro de Crisis */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-tight hidden sm:inline">
            {isCrisisRealActive ? '🚨 Alarma General de Edificio' : 'Guardia Activa 24/7'}
          </span>
        </div>

        <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white">
          <User className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsCrisisRealActive(false)}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                !isCrisisRealActive
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🟢 Modo Regular (1 Botón SOS)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCrisisRealActive(true)}
              className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isCrisisRealActive
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🚨 Simular Alarma General</span>
            </button>
          </div>
          <p className="text-[11px] text-center text-slate-500 font-medium px-2 py-0.5">
            {isCrisisRealActive
              ? '⚡ Modo Crisis General activado: se visualiza el banner de alerta en todas las pantallas de la app y el botón único de rescate.'
              : '⚡ Modo Regular: 1 solo botón de auxilio para emergencias puntuales del departamento con aviso a conserjería.'}
          </p>
        </div>

        {/* Vista Renderizada según el Estado del Switch */}
        {isCrisisRealActive ? (
          <CrisisRealBienestarView />
        ) : (
          <IndividualEmergencyView />
        )}
      </div>
    </div>
  );
};
