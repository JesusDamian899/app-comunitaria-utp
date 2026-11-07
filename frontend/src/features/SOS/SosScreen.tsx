import { ArrowLeft, User, AlertTriangle, CheckCircle2, ShieldAlert, Flame, Phone, Droplets } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_DIRECT_CALLS, MOCK_SPECIALIST_GUARD } from '../../mock/data';

export const SosScreen = () => {
  const { closeSos, isSosAlertSent, toggleSosAlert, showToast } = useApp();

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden pb-8 animate-in fade-in duration-200">
      {/* Encabezado SOS */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 sm:px-6 py-3.5 border-b border-slate-100 shadow-xs">
        <button
          type="button"
          onClick={closeSos}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-bold text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
          <span>Sos Emergencia</span>
        </button>
        <div className="w-9 h-9 rounded-full bg-[#1e293b] flex items-center justify-center text-white">
          <User className="w-5 h-5" />
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Banner de Centro de Crisis */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
          </span>
          <div>
            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Centro de crisis unificado
            </div>
            <div className="text-sm sm:text-base font-extrabold text-slate-900">
              Guardia Activa 24/7
            </div>
          </div>
        </div>

        {/* Caja de Explicación de Emergencia Crítica */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm text-center space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
            ¿Ocurre una emergencia crítica?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
            Alerta instantánea geolocalizada a portería, patrulla local y a los vecinos de tu bloque.
          </p>

          {/* Gran Botón de Pánico Interactivo */}
          <button
            type="button"
            onClick={toggleSosAlert}
            className={`w-full max-w-md mx-auto py-4 px-6 rounded-2xl font-black text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 cursor-pointer ${
              isSosAlertSent
                ? 'bg-[#1e293b] text-white shadow-slate-900/30 ring-2 ring-slate-800'
                : 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-red-600/40 animate-pulse'
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${isSosAlertSent ? 'text-amber-400' : 'text-white'}`} />
            <span>{isSosAlertSent ? '! ALERTA ENVIADA' : 'ACTIVAR BOTÓN DE PÁNICO'}</span>
          </button>

          {/* Estado de alerta despachada */}
          {isSosAlertSent && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 max-w-md mx-auto">
              <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Alerta SOS despachada a Central de Monitoreo</span>
            </div>
          )}
        </div>

        {/* Grid de Llamadas directas y Especialista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Llamadas Directas de Emergencia */}
          <div className="space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
              Llamadas Directas de Emergencia
            </h4>

            <div className="space-y-2">
              {MOCK_DIRECT_CALLS.map((call) => (
                <div
                  key={call.id}
                  className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
                      {call.iconType === 'shield' && <ShieldAlert className="w-5 h-5" />}
                      {call.iconType === 'ambulance' && <span className="font-bold text-sm">🏥</span>}
                      {call.iconType === 'fire' && <Flame className="w-5 h-5 text-red-500" />}
                      {call.iconType === 'police' && <ShieldAlert className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">{call.name}</span>
                        {call.badgeCode && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-1.5 py-0.2 rounded">
                            {call.badgeCode}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500">{call.subtitle}</p>
                    </div>
                  </div>

                  {call.id === 'call-1' ? (
                    <button
                      type="button"
                      onClick={() => showToast(`Llamando a Conserjería (${call.phone})...`)}
                      className="px-3.5 py-1.5 bg-[#172554] hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Llamar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => showToast(`Marcando al ${call.phone}...`)}
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Especialistas en Guardia Activa */}
          <div className="space-y-2.5">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
                Especialistas en Guardia Activa
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Personal verificado con acceso a matrices y llaves maestras
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={MOCK_SPECIALIST_GUARD.avatarUrl}
                    alt={MOCK_SPECIALIST_GUARD.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {MOCK_SPECIALIST_GUARD.name}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                        {MOCK_SPECIALIST_GUARD.eta}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500">{MOCK_SPECIALIST_GUARD.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => showToast(`Contactando a ${MOCK_SPECIALIST_GUARD.name}...`)}
                  className="px-3.5 py-1.5 bg-[#172554] hover:bg-blue-900 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Llamar</span>
                </button>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-2.5 border border-slate-100">
                <Droplets className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  {MOCK_SPECIALIST_GUARD.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
