import { useState, useMemo } from 'react';
import { SolidaridadBanner } from './components/SolidaridadBanner';
import { SolidaridadFilterTabs, type SolidaridadFilter } from './components/SolidaridadFilterTabs';
import { FavorCard } from './components/FavorCard';
import { CreateFavorModal } from './components/CreateFavorModal';
import { FavorDetailsModal } from './components/FavorDetailsModal';
import { MOCK_FAVORES } from '../../mock/data';
import type { SolidaridadFavor } from '../../types';
import { useApp } from '../../context/AppContext';

export const SolidaridadScreen = () => {
  const { showToast } = useApp();

  const [favores, setFavores] = useState<SolidaridadFavor[]>(MOCK_FAVORES);
  const [activeFilter, setActiveFilter] = useState<SolidaridadFilter>('todos');

  // Estados de Modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedFavorForDetails, setSelectedFavorForDetails] = useState<SolidaridadFavor | null>(null);

  // Filtrado según la pestaña seleccionada
  const filteredFavores = useMemo(() => {
    return favores.filter((favor) => {
      if (activeFilter === 'todos') return true;
      if (activeFilter === 'necesito') {
        return favor.type === 'peticion' || favor.type === 'acompanamiento';
      }
      if (activeFilter === 'brindo') {
        return favor.type === 'prestamo';
      }
      return true;
    });
  }, [favores, activeFilter]);

  // Manejador para agregar nuevo favor creado desde el modal
  const handleFavorCreated = (newFavor: SolidaridadFavor) => {
    setFavores((prev) => [newFavor, ...prev]);
  };

  // Manejador de acción directa del botón principal del card
  const handlePrimaryAction = (favor: SolidaridadFavor) => {
    showToast(`¡Solicitud confirmada para: ${favor.title}!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Banner Superior: "Solidaridad en el Portal" y Botón "+ Pedir o prestar (1 Clic)" */}
      <SolidaridadBanner
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        monthlyResolvedCount={18}
      />

      {/* 2. Pestañas de Filtro (Todos / Necesito ayuda / Brindo Ayuda) */}
      <SolidaridadFilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* 3. Grid Responsivo de Peticiones y Préstamos */}
      {filteredFavores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <p className="text-2xl">🤝</p>
          <p className="font-bold text-sm text-slate-800">
            No hay solicitudes en esta categoría
          </p>
          <p className="text-xs text-slate-400">
            Sé el primero en pedir o prestar algo a tus vecinos en el portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredFavores.map((favor) => (
            <FavorCard
              key={favor.id}
              favor={favor}
              onPrimaryAction={handlePrimaryAction}
              onViewDetails={(f) => setSelectedFavorForDetails(f)}
            />
          ))}
        </div>
      )}

      {/* Modal 1: Publicar en Muro Solidario (Regla de 3 clics) */}
      <CreateFavorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFavorCreated={handleFavorCreated}
      />

      {/* Modal 2: Ver Detalles y Confirmar Ayuda */}
      <FavorDetailsModal
        isOpen={!!selectedFavorForDetails}
        favor={selectedFavorForDetails}
        onClose={() => setSelectedFavorForDetails(null)}
        onActionConfirmed={(id) => {
          showToast(`¡Acción confirmada para el elemento #${id}!`);
        }}
      />
    </div>
  );
};
