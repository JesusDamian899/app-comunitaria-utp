import { useState } from 'react';
import { MapPin, ThumbsUp, Star, Phone, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import type { ServiceProvider } from '../../../types';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  defaultExpanded?: boolean;
}

export const ServiceProviderCard = ({
  provider,
  defaultExpanded = true,
}: ServiceProviderCardProps) => {
  const { showToast } = useApp();
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [recommendations, setRecommendations] = useState<number>(provider.recommendationsCount);
  const [hasRecommended, setHasRecommended] = useState<boolean>(false);

  const handleRecommend = () => {
    if (hasRecommended) {
      setRecommendations((r) => r - 1);
      setHasRecommended(false);
      showToast(`Has retirado tu recomendación para ${provider.name}`);
    } else {
      setRecommendations((r) => r + 1);
      setHasRecommended(true);
      showToast(`¡Has recomendado a ${provider.name}!`);
    }
  };

  const firstName = provider.name.split(' ')[1] || provider.name;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4 transition-all">
      {/* Cabecera del Proveedor: Avatar, Nombre, Experiencia y Ubicación */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-blue-100 shadow-2xs"
            />
            {/* Badge de Verificación Vecinal */}
            <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] ring-2 ring-white">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              {provider.name}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {provider.role}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{provider.location}</span>
            </p>
          </div>
        </div>

        {/* Insignia de Años de Experiencia */}
        <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
          {provider.experience}
        </span>
      </div>

      {/* Fila de Visto Bueno y Botón de Recomendar */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="bg-blue-50/80 border border-blue-100 text-blue-800 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span>Visto Bueno ({recommendations} recomiendan)</span>
        </div>

        <button
          type="button"
          onClick={handleRecommend}
          className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
            hasRecommended
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>{hasRecommended ? 'Recomendado' : 'Recomendar'}</span>
        </button>
      </div>

      {/* Sección Expandible: Especialidades, Tarifa y Reseñas de vecinos */}
      {isExpanded && (
        <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
          {/* Especialidades y Tarifa Vecinal */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-1">
            <div className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
              Especialidades y Tarifa Vecinal
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {provider.specialtyDetails}
            </p>
          </div>

          {/* Opiniones de vecinos del edificio */}
          {provider.reviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>💬</span>
                <span>Opiniones de vecinos del edificio</span>
              </div>

              <div className="space-y-2">
                {provider.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-50/60 rounded-xl p-3 border border-slate-100 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {rev.author} • {rev.unit}
                      </span>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle de Ver más / Ocultar detalles */}
      <div className="text-center pt-0.5">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>{isExpanded ? 'Ocultar detalles' : 'Ver más detalles'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Botón de Llamada Directa */}
      <button
        type="button"
        onClick={() => showToast(`Llamando a ${provider.name} (${provider.phone})...`)}
        className="w-full py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
      >
        <Phone className="w-4 h-4" />
        <span>Llamar a {firstName}</span>
      </button>
    </div>
  );
};
