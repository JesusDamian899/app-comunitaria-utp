import { useState, useMemo } from 'react';
import { 
  Search, 
  HeartHandshake, 
  PlusCircle, 
  CheckCircle2, 
  Wrench, 
  Gift, 
  Users, 
  Sparkles,
  type LucideIcon 
} from 'lucide-react';
import { FavorCard } from './components/FavorCard';
import { CreateFavorModal } from './components/CreateFavorModal';
import { MOCK_FAVORES, CURRENT_USER } from '../../mock/data';
import type { SolidaridadFavor, SolidaridadCategory } from '../../types';
import { useApp } from '../../context/AppContext';

export type SolidaridadFilterType = 'todos' | SolidaridadCategory;

// Categorías oficiales con "Intercambio habilidades" como una sola categoría
export const CATEGORIAS_SOLIDARIDAD: {
  id: SolidaridadFilterType;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: 'todos', label: 'Todos', icon: CheckCircle2 },
  { id: 'prestamo', label: 'Préstamo', icon: Wrench },
  { id: 'donacion', label: 'Donación', icon: Gift },
  { id: 'acompanamiento', label: 'Acompañamiento', icon: Users },
  { id: 'intercambio_habilidades', label: 'Intercambio habilidades', icon: Sparkles },
];

export const SolidaridadScreen = () => {
  const { showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<SolidaridadFilterType>('todos');

  // Estado dinámico de favores
  const [favores, setFavores] = useState<SolidaridadFavor[]>(MOCK_FAVORES);

  // Estado de modal de creación (Regla de 3 clics)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Filtrado reactivo en tiempo real por categoría y texto de búsqueda (Idéntico a Servicios)
  const filteredFavores = useMemo(() => {
    return favores.filter((favor) => {
      const matchesCategory =
        selectedCategory === 'todos' ||
        favor.categoria === selectedCategory ||
        favor.type === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        query === '' ||
        favor.title.toLowerCase().includes(query) ||
        (favor.description && favor.description.toLowerCase().includes(query)) ||
        favor.ownerName.toLowerCase().includes(query) ||
        favor.location.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [favores, searchQuery, selectedCategory]);

  // Manejo de nuevo favor creado
  const handleFavorCreated = (newFavor: SolidaridadFavor) => {
    setFavores((prev) => [newFavor, ...prev]);
  };

  // Paso 1: Solicitar ayuda -> Botón se transforma a "Marcar como Recibido"
  const handleRequestHelp = (favor: SolidaridadFavor) => {
    setFavores((prev) =>
      prev.map((f) => (f.id === favor.id ? { ...f, estado: 'ayuda_solicitada' } : f))
    );
    showToast(`Solicitud enviada para: "${favor.title}". Al concluir, marca como Recibido.`);
  };

  const handleMarkAsReceived = (favor: SolidaridadFavor) => {
    setFavores((prev) =>
      prev.map((f) => (f.id === favor.id ? { ...f, estado: 'recibido' } : f))
    );

    // Notificación directa sin modal emergente:
    showToast(`${CURRENT_USER.name} confirmó tu ayuda. ¡Gracias por aportar al barrio!`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Barra de Búsqueda Rápida (Posición y diseño idéntico a Servicios) */}
      <div className="relative w-full">
        <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por artículo, favor o vecino (ej: escalera, taladro, libros)..."
          className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
        />
      </div>

      {/* 2. Chips de Categorías (Posición y diseño idéntico a Servicios: Préstamo, Donación, Acompañamiento, Intercambio habilidades) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
        {CATEGORIAS_SOLIDARIDAD.map(({ id, label, icon: Icon }) => {
          const isSelected = selectedCategory === id;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedCategory(id)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                isSelected
                  ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Banner Promocional con botón de pedir o prestar (Posición y diseño idéntico a Servicios) */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              ¿Necesitas algo o puedes prestar ayuda?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Conéctate con tus vecinos y colabora en el barrio.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full py-2.5 sm:py-3 px-4 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-[0.99]"
        >
          <PlusCircle className="w-4 h-4" />
          <span> Pedir o prestar</span>
        </button>
      </div>

      {/* 4. Encabezado de Sección: "Vecinos Solidarios" (Idéntico a Servicios) */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-blue-600 shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            Vecinos Solidarios
          </h3>
        </div>
      </div>

      {/* 5. Lista / Grid Responsivo de Favores (Visual idéntico a Servicios) */}
      {filteredFavores.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="font-bold text-sm text-slate-800">
            No se encontraron favores para esta búsqueda
          </p>
          <p className="text-xs text-slate-400">
            Prueba buscando con otro término o seleccionando la categoría "Todos".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredFavores.map((favor) => (
            <FavorCard
              key={favor.id}
              favor={favor}
              defaultExpanded={favor.id === 'fav-1'}
              onRequestHelp={handleRequestHelp}
              onMarkAsReceived={handleMarkAsReceived}
            />
          ))}
        </div>
      )}

      {/* Modal: Publicar en Muro Solidario (Regla de 3 clics) */}
      <CreateFavorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onFavorCreated={handleFavorCreated}
      />
    </div>
  );
};
