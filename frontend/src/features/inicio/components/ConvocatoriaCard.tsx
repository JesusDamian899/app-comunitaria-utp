import { Clock, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MOCK_CONVOCATORIA } from '../../../mock/data';

export const ConvocatoriaCard = () => {
  const { hasConfirmedAttendance, toggleAttendance, attendeesCount } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden border-l-4 border-l-blue-600">
      <div className="p-4 space-y-3">
        {/* Etiquetas superiores */}
        <div className="flex items-center justify-between">
          <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <span className="text-blue-600 font-black">!</span> CONVOCATORIA OFICIAL
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {MOCK_CONVOCATORIA.publishedAt}
          </span>
        </div>

        {/* Bloque de fecha y Título de la asamblea */}
        <div className="flex items-start gap-3">
          <div className="w-13 h-14 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center shrink-0 text-center shadow-2xs">
            <span className="text-[9px] font-black text-rose-600 uppercase tracking-wider">
              {MOCK_CONVOCATORIA.month}
            </span>
            <span className="text-lg font-black text-slate-900 leading-none">
              {MOCK_CONVOCATORIA.day}
            </span>
            <span className="text-[9px] font-semibold text-slate-500">
              {MOCK_CONVOCATORIA.dayOfWeek}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
              {MOCK_CONVOCATORIA.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{MOCK_CONVOCATORIA.time}</span>
              <span>•</span>
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{MOCK_CONVOCATORIA.location}</span>
            </div>
          </div>
        </div>

        {/* Puntos clave a votar */}
        <div className="bg-slate-50/70 rounded-xl p-3 space-y-1.5 border border-slate-100">
          <div className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
            Puntos clave a votar
          </div>
          <ul className="space-y-1 text-xs text-slate-700 font-medium">
            {MOCK_CONVOCATORIA.keyPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-blue-700 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Imagen de la fachada con el badge de convocados */}
        <div className="relative rounded-xl overflow-hidden h-36 bg-slate-100">
          <img
            src={MOCK_CONVOCATORIA.imageUrl}
            alt="Fachada del inmueble"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Convocados {attendeesCount} vecinos del inmueble</span>
          </div>
        </div>

        {/* Botón de acción principal: Confirmar asistencia */}
        <button
          type="button"
          onClick={toggleAttendance}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
            hasConfirmedAttendance
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-[#172554] text-white hover:bg-blue-900 active:scale-[0.99]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {hasConfirmedAttendance
              ? '✓ Asistencia Confirmada'
              : 'Confirmar Asistencia'}
          </span>
        </button>
      </div>
    </div>
  );
};
