import { Calendar, Clock, Droplets, ChevronRight } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MOCK_MANTENIMIENTO } from '../../../mock/data';

export const MantenimientoCard = () => {
  const { showToast } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
      {/* Cabecera del aviso de administración */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
            {MOCK_MANTENIMIENTO.issuerInitials}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {MOCK_MANTENIMIENTO.issuerName}
            </h4>
            <span className="text-[10px] text-slate-400">
              {MOCK_MANTENIMIENTO.issuerRole}
            </span>
          </div>
        </div>
        <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
          {MOCK_MANTENIMIENTO.category}
        </span>
      </div>

      {/* Titular y descripción de los trabajos */}
      <div className="space-y-1">
        <h3 className="font-extrabold text-sm text-slate-900">
          {MOCK_MANTENIMIENTO.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {MOCK_MANTENIMIENTO.description}
        </p>
      </div>

      {/* Cajas de Fecha y Franja Horaria */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Fecha</div>
            <div className="text-xs font-bold text-slate-800">
              {MOCK_MANTENIMIENTO.dateText}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Franja</div>
            <div className="text-xs font-bold text-slate-800">
              {MOCK_MANTENIMIENTO.timeSlot}
            </div>
          </div>
        </div>
      </div>

      {/* Alerta de corte y botón de detalles */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-semibold">
          <Droplets className="w-3.5 h-3.5 shrink-0" />
          <span>{MOCK_MANTENIMIENTO.alertNote}</span>
        </div>
        <button
          type="button"
          onClick={() => showToast('Detalles técnicos: inspección anual')}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5 cursor-pointer"
        >
          <span>Ver detalles</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
