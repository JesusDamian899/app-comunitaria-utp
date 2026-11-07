import { X, MapPin, Clock, CheckCircle2, HandHeart } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { SolidaridadFavor } from '../../../types';

interface FavorDetailsModalProps {
  isOpen: boolean;
  favor: SolidaridadFavor | null;
  onClose: () => void;
  onActionConfirmed: (favorId: string) => void;
}

export const FavorDetailsModal = ({
  isOpen,
  favor,
  onClose,
  onActionConfirmed,
}: FavorDetailsModalProps) => {
  const { showToast } = useApp();

  if (!isOpen || !favor) return null;

  const handleAction = () => {
    onActionConfirmed(favor.id);
    showToast(`¡Solicitud enviada para: ${favor.title}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
              {favor.badgeTag}
            </span>
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{favor.badgeTime}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido del Detalle */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-snug">
              {favor.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{favor.location}</span>
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Estado de la solicitud
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Disponible en la comunidad</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAction}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
            >
              <HandHeart className="w-4 h-4" />
              <span>{favor.actionButtonText} (1 Clic)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
