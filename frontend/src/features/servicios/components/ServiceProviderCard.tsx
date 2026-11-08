import { useState } from 'react';
import { MapPin, ThumbsUp, Star, ChevronUp, ChevronDown, Check, MessageCircle, KeyRound, RotateCcw } from 'lucide-react';
import type { ServiceProvider } from '../../../types';

interface ServiceProviderCardProps {
  provider: ServiceProvider;
  defaultExpanded?: boolean;
  onRecommendClick: (provider: ServiceProvider) => void;
}

export const ServiceProviderCard = ({
  provider,
  defaultExpanded = true,
  onRecommendClick,
}: ServiceProviderCardProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  // Estado que detecta si el usuario ya fue redirigido a WhatsApp
  const [hasContactedWhatsapp, setHasContactedWhatsapp] = useState<boolean>(false);

  const firstName = provider.name.split(' ')[1] || provider.name;
  const isProfesion = provider.tipoActividad === 'profesion';

  const whatsappUrl = `https://wa.me/51${provider.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hola ${provider.name}, te contacto desde la app de vecinos de la urbanización sobre tu servicio de ${provider.role}.`
  )}`;

  const handleOpenWhatsapp = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    // Al ser redirigido, el botón cambia de estado para permitir recomendar
    setHasContactedWhatsapp(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4 transition-all">
      {/* Cabecera del Proveedor: Avatar, Nombre, Carrera/Rol y Ubicación */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
            />
            {/* Insignia de Verificación: ÚNICAMENTE visible para personas con Profesión */}
            {isProfesion && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[11px] ring-2 ring-white shadow-xs"
                title="Profesión Verificada"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                {provider.name}
              </h4>
              {/* Check de verificación para profesionales */}
              {isProfesion && (
                <span title="Profesión Verificada" className="inline-flex items-center text-blue-600">
                  <Check className="w-4 h-4 stroke-[3]" />
                </span>
              )}
            </div>

            {/* Carrera o especialidad del vecino (sin colegiatura visible en el banner) */}
            <p className="text-xs sm:text-sm text-slate-700 font-semibold">
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

      {/* Fila de Visto Bueno (El botón de recomendar fue retirado de aquí conforme al requerimiento) */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="bg-blue-50/80 border border-blue-100 text-blue-800 text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
          <ThumbsUp className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
          <span>Visto Bueno ({provider.recommendationsCount} recomiendan)</span>
        </div>
      </div>

      {/* Sección Expandible: Especialidades, Tarifa y Reseñas de vecinos */}
      {isExpanded && (
        <div className="space-y-3.5 pt-1 animate-in fade-in duration-200">
          {/* Especialidades y Tarifa Vecinal */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-1">
            <div className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
              Detalles del Servicio en la Urbanización
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              {provider.specialtyDetails}
            </p>
          </div>

          {/* Opiniones de vecinos de la urbanización */}
          {provider.reviews.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>💬</span>
                <span>Opiniones de vecinos de la urbanización</span>
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

      {/* REQUISITO: Chat WhatsApp que cambia a "¿Recomiendas el servicio?" tras ser redirigido */}
      <div className="space-y-1.5">
        {!hasContactedWhatsapp ? (
          <button
            type="button"
            onClick={handleOpenWhatsapp}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/20 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>Chat WhatsApp con {firstName}</span>
          </button>
        ) : (
          <div className="space-y-2 animate-in zoom-in-95 duration-200">
            {/* Botón transformado: ¿Recomiendas el servicio? con validación de PIN */}
            <button
              type="button"
              onClick={() => onRecommendClick(provider)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-700/20 transition-all ring-2 ring-blue-300"
            >
              <KeyRound className="w-4 h-4 text-amber-300 shrink-0" />
              <span>¿Recomiendas el servicio? (Ingresar PIN)</span>
            </button>

            {/* Enlace para volver a abrir WhatsApp si necesita escribirle nuevamente */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleOpenWhatsapp}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>¿Escribir nuevamente por WhatsApp a {firstName}?</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
