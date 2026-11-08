import { useState } from 'react';
import { 
  MapPin, 
  CheckCircle2, 
  MessageCircle,
  RotateCcw
} from 'lucide-react';
import type { SolidaridadFavor } from '../../../types';
import { CommunityBadge } from '../../../components/ui/CommunityBadge';

interface FavorCardProps {
  favor: SolidaridadFavor;
  defaultExpanded?: boolean;
  onRequestHelp: (favor: SolidaridadFavor) => void;
  onMarkAsReceived: (favor: SolidaridadFavor) => void;
}

export const FavorCard = ({
  favor,
  onRequestHelp,
  onMarkAsReceived,
}: FavorCardProps) => {
  const [hasContactedWhatsapp, setHasContactedWhatsapp] = useState<boolean>(
    favor.estado === 'ayuda_solicitada'
  );

  const isRequested = favor.estado === 'ayuda_solicitada';
  const isReceived = favor.estado === 'recibido';

  const firstName = favor.ownerName.split(' ')[0] || favor.ownerName;
  const defaultAvatar =
    favor.ownerAvatarUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const categoryLabel = {
    prestamo: 'Préstamo',
    donacion: 'Donación',
    acompanamiento: 'Acompañamiento',
    intercambio_habilidades: 'Intercambio habilidades',
  }[favor.categoria || 'prestamo'] || favor.badgeTag;

  const phone = favor.phone || '998765432';
  const whatsappUrl = `https://wa.me/51${phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    `Hola ${favor.ownerName}, te contacto desde la app de vecinos de la urbanización sobre tu publicación de ${favor.title} en Solidaridad.`
  )}`;

  const handleOpenWhatsapp = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    // Al ser redirigido, el botón cambia de estado para permitir marcar como recibido
    setHasContactedWhatsapp(true);
    onRequestHelp(favor);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4 transition-all">
      {/* Cabecera: Avatar, Nombre, Rol/Título y Ubicación (Idéntico a ServiceProviderCard) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <img
              src={defaultAvatar}
              alt={favor.ownerName}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-slate-100 shadow-2xs"
            />
            {favor.donorBadgeLevel === 'heroe_del_barrio' && (
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center text-[10px] font-black ring-2 ring-white shadow-xs"
                title="Héroe del barrio"
              >
                👑
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                {favor.ownerName}
              </h4>
              {favor.donorBadgeLevel && (
                <CommunityBadge level={favor.donorBadgeLevel} size="xs" />
              )}
            </div>

            {/* Rol o título del favor */}
            <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-snug">
              {favor.title}
            </p>

            <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{favor.location}</span>
            </p>
          </div>
        </div>

        {/* Insignia / Pill superior derecho (Idéntico a Servicios) */}
        <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
          {categoryLabel}
        </span>
      </div>

      {/* Descripción del favor o recurso (siempre visible, sin extend) */}
      <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-1">
        <div className="text-[10px] font-black tracking-wider text-slate-700 uppercase">
          Detalles del Favor en la Urbanización
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {favor.description || `${favor.title}. Disponible para vecinos de la urbanización.`}
        </p>
      </div>

      {/* REQUISITO: Chat WhatsApp como en Servicios que cambia a "Marcar como Recibido" tras ser redirigido */}
      <div className="space-y-1.5">
        {isReceived ? (
          <button
            type="button"
            disabled
            className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-default"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Ayuda Recibida</span>
          </button>
        ) : !hasContactedWhatsapp && !isRequested ? (
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
            {/* Botón transformado: Marcar como Recibido */}
            <button
              type="button"
              onClick={() => onMarkAsReceived(favor)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 transition-all ring-2 ring-emerald-300"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar como Recibido</span>
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
