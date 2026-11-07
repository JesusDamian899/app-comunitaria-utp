import { PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ScopeFilterChips } from './components/ScopeFilterChips';
import { ConvocatoriaCard } from './components/ConvocatoriaCard';
import { MantenimientoCard } from './components/MantenimientoCard';
import { ActaCard } from './components/ActaCard';

export const InicioScreen = () => {
  const { showToast } = useApp();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Saludo personalizado & Botón de publicar aviso */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Hola, Carlos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Resumen de actividad en tu comunidad
          </p>
        </div>
        <button
          type="button"
          onClick={() => showToast('Formulario para publicar nuevo aviso')}
          className="px-4 py-2 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Aviso</span>
        </button>
      </div>

      {/* Chips de filtro de alcance vecinal */}
      <ScopeFilterChips />

      {/* Grid adaptativo: 1 columna en móvil y 3 columnas armónicas en tablet/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Columna Principal: Convocatoria Oficial de Asamblea */}
        <div className="lg:col-span-2">
          <ConvocatoriaCard />
        </div>

        {/* Columna Lateral: Mantenimientos y Actas */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <MantenimientoCard />
          <ActaCard />
        </div>
      </div>
    </div>
  );
};
