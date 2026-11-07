import { Building2, ChevronDown, Search, Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopHeader = () => {
  const { setCurrentTab, showToast } = useApp();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-100">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#172554] text-white shadow-xs">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-base font-extrabold tracking-tight text-[#172554] leading-tight">
            Vecinos
          </span>
          <button
            type="button"
            onClick={() => showToast('Edificio Roble • Portal B seleccionado')}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span>Edificio Roble • Portal B</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Iconos de Acción */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => showToast('Buscador rápido activado')}
          aria-label="Buscar"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="h-4.5 w-4.5" />
        </button>

        <button
          type="button"
          onClick={() => showToast('Tienes 2 avisos sin leer de la comunidad')}
          aria-label="Notificaciones"
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="h-4.5 w-4.5" />
          {/* Indicador de notificación no leída */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentTab('perfil')}
          aria-label="Mi Perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e293b] text-white shadow-xs hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
