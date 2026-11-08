import { useState } from 'react';
import { Trophy, Medal, Sparkles, Info, X, HeartHandshake, ShieldCheck, ChevronRight } from 'lucide-react';
import { MOCK_TOP_VECINOS_DEL_MES } from '../../../mock/data';
import { CommunityBadge } from '../../../components/ui/CommunityBadge';
import { useApp } from '../../../context/AppContext';

export const VecinoDelMesBoard = () => {
  const { setCurrentTab } = useApp();
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState(false);

  // Ordenamos si se desea visualizar en podium: 2do (izq), 1ro (centro), 3ro (der) en pantallas medianas/grandes
  const first = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 1);
  const second = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 2);
  const third = MOCK_TOP_VECINOS_DEL_MES.find((v) => v.position === 3);

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-white to-blue-50/50 rounded-3xl border border-amber-200/80 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Encabezado del Tablero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-amber-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Trophy className="w-5 h-5 text-amber-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                Tablero: Vecino del Mes
              </h3>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                Octubre
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Urb. Las Palmeras • Reconocimiento a los 3 vecinos con más favores comunitarios
            </p>
          </div>
        </div>

        {/* Botón de información de niveles de Gamificación */}
        <button
          type="button"
          onClick={() => setIsGamificationModalOpen(true)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-100/80 hover:bg-amber-200/80 px-3 py-1.5 rounded-xl border border-amber-300 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5 text-amber-700" />
          <span>Niveles e Insignias</span>
        </button>
      </div>

      {/* Podium Grid Responsivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
        {/* 2do Lugar (Plata) */}
        {second && (
          <div className="order-2 md:order-1 bg-white/90 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-black px-2.5 py-0.5 rounded-lg border border-slate-300">
                  <Medal className="w-3.5 h-3.5 text-slate-500" />
                  #2 Lugar
                </span>
                <CommunityBadge level={second.level} size="xs" />
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={second.avatarUrl}
                  alt={second.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-slate-300 shadow-xs shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {second.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {second.calle} {second.numero}
                  </p>
                  <p className="text-xs font-black text-amber-700 pt-0.5">
                    {second.favoresCount} favores resueltos
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                "{second.destacadoPor}"
              </p>
            </div>
          </div>
        )}

        {/* 1er Lugar (Héroe del barrio / Campeón) - Destacado al centro */}
        {first && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-4.5 flex flex-col justify-between shadow-md shadow-amber-500/10 hover:shadow-lg transition-all relative overflow-hidden">
            {/* Cinta decorativa superior */}
            <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 text-[9px] font-black uppercase px-3 py-0.5 rounded-bl-xl shadow-xs">
              👑 Gran Colaborador
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-2xs">
                  <Trophy className="w-3.5 h-3.5 text-slate-950" />
                  #1 Campeón del Mes
                </span>
                <CommunityBadge level={first.level} size="xs" />
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={first.avatarUrl}
                    alt={first.name}
                    className="w-15 h-15 rounded-full object-cover ring-3 ring-amber-400 shadow-md shrink-0"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs ring-2 ring-white">
                    1º
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                    {first.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {first.calle} {first.numero}
                  </p>
                  <p className="text-xs font-black text-amber-800 pt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{first.favoresCount} favores resueltos</span>
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-amber-950 font-medium bg-amber-100/70 p-2 rounded-xl border border-amber-200/70">
                "{first.destacadoPor}"
              </p>
            </div>
          </div>
        )}

        {/* 3er Lugar (Bronce) */}
        {third && (
          <div className="order-3 bg-white/90 rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-lg border border-amber-300">
                  <Medal className="w-3.5 h-3.5 text-amber-700" />
                  #3 Lugar
                </span>
                <CommunityBadge level={third.level} size="xs" />
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={third.avatarUrl}
                  alt={third.name}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-amber-300 shadow-xs shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                    {third.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {third.calle} {third.numero}
                  </p>
                  <p className="text-xs font-black text-amber-700 pt-0.5">
                    {third.favoresCount} favores resueltos
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                "{third.destacadoPor}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pie interactivo para motivar la participación */}
      <div className="bg-white/80 rounded-2xl p-3 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 text-slate-700 text-center sm:text-left">
          <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>¿Quieres aparecer en el tablero?</strong> Cada favor que prestas o apoyas en Solidaridad te otorga puntos comunitarios.
          </span>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('solidaridad')}
          className="inline-flex items-center gap-1 font-extrabold text-amber-900 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer"
        >
          <span>Ir a Solidaridad</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal Educativo: Sistema de Gamificación Comunitaria */}
      {isGamificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/70">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Niveles de Estatus Comunitario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGamificationModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Niveles oficiales de Gamificación */}
            <div className="p-5 sm:p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                El estatus comunitario premia la solidaridad y reciprocidad entre vecinos de la urbanización. Cada vez que concluyes una ayuda en el módulo Solidaridad, subes de rango:
              </p>

              <div className="space-y-2.5">
                {/* Nivel 1: Bronce */}
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CommunityBadge level="bronce" size="md" />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Nivel Bronce</p>
                      <p className="text-[11px] text-slate-500">De 1 a 4 favores realizados</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                    Inicial
                  </span>
                </div>

                {/* Nivel 2: Plata */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CommunityBadge level="plata" size="md" />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Nivel Plata</p>
                      <p className="text-[11px] text-slate-500">De 5 a 9 favores realizados</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Solidario
                  </span>
                </div>

                {/* Nivel 3: Oro */}
                <div className="p-3 bg-yellow-50/80 rounded-2xl border border-yellow-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CommunityBadge level="oro" size="md" />
                    <div>
                      <p className="font-extrabold text-xs text-slate-900">Nivel Oro</p>
                      <p className="text-[11px] text-slate-500">De 10 a 19 favores realizados</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-900 bg-white px-2 py-0.5 rounded-md border border-yellow-200">
                    Ejemplar
                  </span>
                </div>

                {/* Nivel 4: Héroe del barrio */}
                <div className="p-3 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-600/20 rounded-2xl border-2 border-amber-400 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CommunityBadge level="heroe_del_barrio" size="md" />
                    <div>
                      <p className="font-black text-xs text-slate-900">Héroe del barrio</p>
                      <p className="text-[11px] text-slate-600">20 o más favores completados</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-amber-950 bg-amber-400 px-2 py-0.5 rounded-md shadow-2xs">
                    Máxima Insignia
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100 flex items-start gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Las insignias son visibles en el perfil de cada residente, en las tarjetas de ayuda y en el Tablero de Vecino del Mes.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGamificationModalOpen(false)}
                className="w-full py-2.5 px-4 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
