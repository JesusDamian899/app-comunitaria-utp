import { AlertTriangle, Flame, Building2, Phone, RotateCcw } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const CrisisRealBienestarView = () => {
  const { isSosAlertSent, toggleSosAlert, showToast } = useApp();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Banner de Crisis Multizona Activa */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-red-600/30 space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-300"></span>
          </span>
          <span className="text-xs font-black tracking-wider uppercase bg-black/25 px-3 py-0.5 rounded-full">
            🚨 Protocolo de Crisis General Activo
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-black leading-tight">
          Alarma Comunitaria: Sismo / Incendio Detectado
        </h3>
      </div>

      {/* Tarjeta con UN SOLO BOTÓN DE ACCIÓN: RESCATE PRIORITARIO */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 text-center space-y-4">
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-black text-slate-900 pt-1">
            ¿Te encuentras atrapado o necesitas auxilio físico para evacuar?
          </h4>
        </div>

        {/* EL ÚNICO BOTÓN EN CRISIS */}
        <div className="pt-2">
          <button
            type="button"
            onClick={toggleSosAlert}
            className={`w-full max-w-md mx-auto py-4 sm:py-5 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition-all transform active:scale-95 cursor-pointer ${
              isSosAlertSent
                ? 'bg-[#1e293b] text-white shadow-slate-900/30 ring-4 ring-rose-500'
                : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white shadow-red-600/40 animate-bounce'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${isSosAlertSent ? 'text-amber-400' : 'text-white'}`} />
            <span>{isSosAlertSent ? '! RESCATE EN CAMINO • RESCATISTAS INFORMADOS' : '🔴 SOLICITAR RESCATE PRIORITARIO (DPTO 4ºA)'}</span>
          </button>
        </div>

        {/* Estado del despacho del rescate */}
        {isSosAlertSent && (
          <div className="space-y-2.5 max-w-md mx-auto pt-1">
            <button
              type="button"
              onClick={toggleSosAlert}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold underline inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>¿Ya lograste evacuar y estás a salvo en el exterior? Cancelar pedido</span>
            </button>
          </div>
        )}
      </div>

      {/* Reglas de Evacuación Segura (Sismo / Incendio) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Protocolo de Evacuación Rápida (Portal B)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
            <div className="font-black text-rose-800 flex items-center gap-1.5">
              <span>🚫</span>
              <span>NO USAR ASCENSORES</span>
            </div>
            <p className="text-rose-700 text-[11px] font-medium leading-relaxed">
              Cortados preventivamente para evitar atrapamiento por fallas eléctricas.
            </p>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
            <div className="font-black text-blue-800 flex items-center gap-1.5">
              <span>🏃</span>
              <span>ESCALERAS PORTAL B</span>
            </div>
            <p className="text-blue-700 text-[11px] font-medium leading-relaxed">
              Descender tomándose del pasamanos derecho hacia la puerta principal de la calle.
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
            <div className="font-black text-emerald-800 flex items-center gap-1.5">
              <span>📍</span>
              <span>PUNTO DE REUNIÓN</span>
            </div>
            <p className="text-emerald-700 text-[11px] font-medium leading-relaxed">
              Patio central del edificio o explanada del Parque Las Palmeras (lejos de vidrios).
            </p>
          </div>
        </div>

        {/* Llamadas de Crisis */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => showToast('Conectando directamente con la central de Bomberos 116...')}
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Llamar a Bomberos (116)</span>
          </button>

          <button
            type="button"
            onClick={() => showToast('Llamando a Conserjería Central / Portero...')}
            className="flex-1 py-3 px-4 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span>Llamar a Garita de Conserjería</span>
          </button>
        </div>
      </div>
    </div>
  );
};
