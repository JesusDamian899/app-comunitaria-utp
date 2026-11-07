import { ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingSosButton = () => {
  const { openSos } = useApp();

  return (
    <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-8 lg:right-12 z-40">
      <button
        type="button"
        onClick={openSos}
        aria-label="Botón de Pánico SOS"
        className="flex items-center gap-2 bg-[#dc2626] hover:bg-red-700 active:scale-95 text-white font-black text-sm sm:text-base px-4 sm:px-5 py-2.5 sm:py-3 rounded-full shadow-lg shadow-red-600/40 hover:shadow-red-600/60 transition-all cursor-pointer ring-4 ring-white"
      >
        <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-red-600" />
        <span className="tracking-wider">SOS</span>
      </button>
    </div>
  );
};
