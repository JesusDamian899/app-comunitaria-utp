import { ThumbsUp, HandHeart, CalendarCheck } from 'lucide-react';

interface ProfileStatsProps {
  vistosBuenos?: number;
  favoresCount?: number;
  asistenciaPorcentaje?: string;
}

export const ProfileStats = ({
  vistosBuenos = 18,
  favoresCount = 7,
  asistenciaPorcentaje = '100%',
}: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {/* Métrica 1: Vistos Buenos (perfiles.vistos_buenos) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 text-center shadow-2xs space-y-1">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
          <ThumbsUp className="w-4 h-4 fill-blue-600" />
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
          {vistosBuenos}
        </div>
        <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">
          Vistos Buenos
        </div>
      </div>

      {/* Métrica 2: Favores en Muro Solidario (muro_solidario) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 text-center shadow-2xs space-y-1">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
          <HandHeart className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
          {favoresCount}
        </div>
        <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">
          Favores Muro
        </div>
      </div>

      {/* Métrica 3: Asistencia a Asambleas */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 text-center shadow-2xs space-y-1">
        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mx-auto">
          <CalendarCheck className="w-4 h-4 text-purple-600" />
        </div>
        <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
          {asistenciaPorcentaje}
        </div>
        <div className="text-[10px] sm:text-xs text-slate-500 font-semibold">
          Asambleas
        </div>
      </div>
    </div>
  );
};
