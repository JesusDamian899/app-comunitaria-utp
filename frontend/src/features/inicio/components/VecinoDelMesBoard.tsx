import { useState } from 'react';
import { Trophy, Medal} from 'lucide-react';
import { MOCK_TOP_VECINOS_DEL_MES } from '../../../mock/data';
import { CommunityBadge } from '../../../components/ui/CommunityBadge';
import { useApp } from '../../../context/AppContext';

export const VecinoDelMesBoard = () => {
  const { } = useApp();
  const [] = useState(false);

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
                Vecino Solidario del Mes
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
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

        {first && (
          <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-white rounded-2xl border-2 border-amber-400 p-4.5 flex flex-col justify-between shadow-md shadow-amber-500/10 hover:shadow-lg transition-all relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-lg shadow-2xs">
                  <Trophy className="w-3.5 h-3.5 text-slate-950" />
                  #1 Lugar 
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
                </div>

                <div>
                  <h4 className="font-black text-sm sm:text-base text-slate-900 leading-snug">
                    {first.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {first.calle} {first.numero}
                  </p>
                  <p className="text-xs font-black text-amber-800 pt-0.5 flex items-center gap-1">
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
    </div>
  );
};
