import { Wrench, Sprout, Users, MapPin } from 'lucide-react';
import type { SolidaridadFavor } from '../../../types';

interface FavorCardProps {
  favor: SolidaridadFavor;
  onPrimaryAction: (favor: SolidaridadFavor) => void;
  onViewDetails: (favor: SolidaridadFavor) => void;
}

export const FavorCard = ({
  favor,
  onPrimaryAction,
  onViewDetails,
}: FavorCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-3.5 transition-all hover:shadow-md">
      {/* Etiqueta superior y Horario / Fecha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            {favor.iconName === 'wrench' && <Wrench className="w-4 h-4 text-blue-700" />}
            {favor.iconName === 'plant' && <Sprout className="w-4 h-4 text-emerald-600" />}
            {favor.iconName === 'users' && <Users className="w-4 h-4 text-indigo-600" />}
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {favor.badgeTag}
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-md">
          {favor.badgeTime}
        </span>
      </div>

      {/* Titular y Detalle de ubicación / Autor */}
      <div className="space-y-1">
        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
          {favor.title}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{favor.location}</span>
        </p>
      </div>

      {/* Botones de acción según la imagen */}
      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onPrimaryAction(favor)}
          className="flex-1 py-2.5 px-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all shadow-xs"
        >
          {favor.actionButtonText}
        </button>
        <button
          type="button"
          onClick={() => onViewDetails(favor)}
          className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all"
        >
          Ver detalles
        </button>
      </div>
    </div>
  );
};
