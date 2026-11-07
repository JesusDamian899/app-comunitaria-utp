import { Building2, ChevronDown, HelpCircle, Bell, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopHeader = () => {
  const { setCurrentTab, showToast, openTutorial } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand & Selector de Portal / Edificio */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172554] text-white shadow-xs">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#172554] leading-tight">
              Vecinos
            </span>
            <button
              type="button"
              onClick={() => showToast('Edificio Roble • Portal B seleccionado')}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <span>Edificio Roble • Portal B</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Iconos de Acción: [ ? (Tutorial) ] [ Campana ] [ Perfil ] */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Icono '?' para abrir el Tutorial Interactivo de la aplicación */}
          <button
            type="button"
            onClick={() => openTutorial()}
            aria-label="Tutorial y Guía de la aplicación"
            title="¿Cómo funciona la app? Ver tutorial"
            className="flex h-9 w-9 items-center justify-center rounded-full text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => showToast('Tienes 2 avisos sin leer de la comunidad')}
            aria-label="Notificaciones"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Bell className="h-5 w-5" />
            {/* Indicador de notificación no leída */}
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('perfil')}
            aria-label="Mi Perfil"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1e293b] text-white shadow-xs hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
          >
            <User className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
