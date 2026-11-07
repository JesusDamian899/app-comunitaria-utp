import { ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FloatingSosButton = () => {
  const { openSos } = useApp();

  return (
    <div className="absolute bottom-20 right-4 z-40">
      <button
        onClick={openSos}
        aria-label="Botón de Pánico SOS"
        className="flex items-center gap-1.5 bg-[#dc2626] hover:bg-red-700 text-white font-black text-sm px-4 py-2.5 rounded-full shadow-lg shadow-red-600/50 hover:shadow-red-600/70 transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-3 ring-white"
      >
        <ShieldAlert className="w-5 h-5 fill-white text-red-600" />
        <span className="tracking-wider">SOS</span>
      </button>
    </div>
  );
};
