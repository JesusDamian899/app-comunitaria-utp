import { ShieldAlert, Flame } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingSosButton = () => {
  const { openSos, isCrisisRealActive } = useApp();

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 lg:right-12 z-40">
      <button
        type="button"
        onClick={openSos}
        aria-label="Botón de Pánico SOS"
        className={`flex items-center gap-2 font-black text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-lg transition-all cursor-pointer ring-4 ring-white active:scale-95 ${
          isCrisisRealActive
            ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-600/60 animate-bounce ring-amber-300'
            : 'bg-[#dc2626] hover:bg-red-700 text-white shadow-red-600/40 hover:shadow-red-600/60'
        }`}
      >
        {isCrisisRealActive ? (
          <>
            <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
            <span className="tracking-wider">🚨 CRISIS ACTIVA</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-red-600" />
            <span className="tracking-wider">SOS</span>
          </>
        )}
      </button>
    </div>
  );
};
