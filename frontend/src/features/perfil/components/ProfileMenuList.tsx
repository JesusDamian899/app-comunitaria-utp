import { FileText, HandHeart, ShieldAlert, Bell, ChevronRight, LogOut } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const ProfileMenuList = () => {
  const { showToast } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm divide-y divide-slate-100 overflow-hidden">
      {/* Mis Oficios Locales */}
      <button
        type="button"
        onClick={() => showToast('Abriendo tus oficios activos en el edificio')}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div>Mis Publicaciones y Oficios</div>
            <div className="text-[11px] text-slate-400 font-normal">
              1 servicio activo en oficios_locales
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Mis Solicitudes en Muro Solidario */}
      <button
        type="button"
        onClick={() => showToast('Abriendo tus favores y préstamos en Muro Solidario')}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <HandHeart className="w-4 h-4" />
          </div>
          <div>
            <div>Mis Peticiones y Préstamos</div>
            <div className="text-[11px] text-slate-400 font-normal">
              2 solicitudes en muro_solidario
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Contactos de Emergencia SOS */}
      <button
        type="button"
        onClick={() => showToast('Configuración de contactos prioritarios SOS')}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div>Contactos de Emergencia SOS</div>
            <div className="text-[11px] text-slate-400 font-normal">
              Portería Central + 2 familiares guardados
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Notificaciones de la Comunidad */}
      <button
        type="button"
        onClick={() => showToast('Preferencias de notificaciones comunitarias')}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div>Notificaciones del Edificio Roble</div>
            <div className="text-[11px] text-slate-400 font-normal">
              Alertas por corte de agua y asambleas activadas
            </div>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Cerrar Sesión */}
      <button
        type="button"
        onClick={() => showToast('Sesión de Carlos Mendoza')}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-rose-50/50 cursor-pointer text-xs sm:text-sm font-bold text-rose-600 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Cerrar sesión en Edificio Roble</span>
        </div>
      </button>
    </div>
  );
};
