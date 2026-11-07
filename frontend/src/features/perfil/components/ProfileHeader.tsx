import { ShieldCheck, Phone, MapPin } from 'lucide-react';
import { CURRENT_USER } from '../../../mock/data';

interface ProfileHeaderProps {
  vistosBuenosCount?: number;
}

export const ProfileHeader = ({ vistosBuenosCount = 18 }: ProfileHeaderProps) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        {/* Avatar con anillo y badge de verificación */}
        <div className="relative shrink-0">
          <img
            src={CURRENT_USER.avatarUrl}
            alt={CURRENT_USER.name}
            className="w-20 h-20 sm:w-22 sm:h-22 rounded-full object-cover ring-4 ring-blue-100 shadow-md"
          />
          <div 
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-xs"
            title="Vecino Verificado"
          >
            ✓
          </div>
        </div>

        {/* Datos Personales y Estado de Confianza */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {CURRENT_USER.name} Mendoza
              </h3>
              <p className="text-xs sm:text-sm font-bold text-blue-700">
                {CURRENT_USER.role}
              </p>
            </div>

            {/* Chip de Estrategia de Confianza (Imagen 1) */}
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full self-center sm:self-start">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confianza Ganada ({vistosBuenosCount} Vistos Buenos)</span>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>{CURRENT_USER.building} • {CURRENT_USER.portal} ({CURRENT_USER.apartment})</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{CURRENT_USER.phone}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
