import { HandHeart, PlusCircle } from 'lucide-react';

interface SolidaridadBannerProps {
  onOpenCreateModal: () => void;
  monthlyResolvedCount?: number;
}

export const SolidaridadBanner = ({
  onOpenCreateModal,
  monthlyResolvedCount = 18,
}: SolidaridadBannerProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Tarjeta de Resumen Mensual */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex items-center gap-3.5">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-100/80 text-blue-800 flex items-center justify-center shrink-0">
          <HandHeart className="w-6 h-6 text-blue-700" />
        </div>
        <div className="space-y-0.5">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
            Solidaridad en el Portal
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Edificio Roble • {monthlyResolvedCount} favores resueltos este mes
          </p>
        </div>
      </div>

      {/* Botón de Acción Principal (Regla de los 3 clics - Clic 1) */}
      <button
        type="button"
        onClick={onOpenCreateModal}
        className="w-full py-3 sm:py-3.5 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-950/15 transition-all"
      >
        <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>+ Pedir o prestar en el portal (1 Clic)</span>
      </button>
    </div>
  );
};
