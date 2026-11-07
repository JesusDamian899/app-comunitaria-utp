import { useState, useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { SearchServiceBar } from './components/SearchServiceBar';
import { ServiceCategoryChips, type ServiceCategory } from './components/ServiceCategoryChips';
import { PublishServiceBanner } from './components/PublishServiceBanner';
import { ServiceProviderCard } from './components/ServiceProviderCard';
import { CreateServiceModal } from './components/CreateServiceModal';
import { RecommendModal } from './components/RecommendModal';
import { MOCK_PROVIDERS } from '../../mock/data';
import type { ServiceProvider, ServiceReview } from '../../types';

export const ServiciosScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('todos');

  // Estado dinámico de proveedores alineado al modelado oficios_locales y perfiles
  const [providers, setProviders] = useState<ServiceProvider[]>(MOCK_PROVIDERS);

  // Estados de modales (Regla de 3 clics)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [recommendingProvider, setRecommendingProvider] = useState<ServiceProvider | null>(null);

  // Filtrado reactivo en tiempo real por categoría y texto de búsqueda
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesCategory =
        selectedCategory === 'todos' || provider.category === selectedCategory;

      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        query === '' ||
        provider.name.toLowerCase().includes(query) ||
        provider.role.toLowerCase().includes(query) ||
        provider.specialtyDetails.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [providers, searchQuery, selectedCategory]);

  // Manejo de nuevo oficio creado
  const handleServiceCreated = (newService: ServiceProvider) => {
    setProviders((prev) => [newService, ...prev]);
  };

  // Manejo de visto bueno (vistos_buenos en perfiles)
  const handleRecommendationSubmitted = (
    providerId: string,
    updatedVistosBuenos: number,
    newReview?: ServiceReview
  ) => {
    setProviders((prev) =>
      prev.map((prov) => {
        if (prov.id === providerId) {
          return {
            ...prov,
            recommendationsCount: updatedVistosBuenos,
            reviews: newReview ? [newReview, ...prov.reviews] : prov.reviews,
          };
        }
        return prov;
      })
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Barra de Búsqueda Rápida */}
      <SearchServiceBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* 2. Chips de Categorías (Fontanería, Electricidad, Cerrajería, Hogar) */}
      <ServiceCategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Banner Promocional con apertura directa del modal (Clic 1) */}
      <PublishServiceBanner
        onOpenPublish={() => setIsCreateModalOpen(true)}
      />

      {/* 4. Encabezado de Sección: "Profesionales de Confianza" */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            Profesionales de Confianza
          </h3>
        </div>
        <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-full">
          {filteredProviders.length} disponibles
        </span>
      </div>

      {/* 5. Lista / Grid Responsivo de Profesionales */}
      {filteredProviders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <p className="text-2xl">🔍</p>
          <p className="font-bold text-sm text-slate-800">
            No se encontraron profesionales para esta búsqueda
          </p>
          <p className="text-xs text-slate-400">
            Prueba buscando con otro término o seleccionando la categoría "Todos".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredProviders.map((provider) => (
            <ServiceProviderCard
              key={provider.id}
              provider={provider}
              defaultExpanded={provider.id === 'prov-1'}
              onRecommendClick={(prov) => setRecommendingProvider(prov)}
            />
          ))}
        </div>
      )}

      {/* Modal 1: Crear Servicio (oficios_locales) */}
      <CreateServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onServiceCreated={handleServiceCreated}
      />

      {/* Modal 2: Recomendar Profesional (perfiles.vistos_buenos) */}
      <RecommendModal
        isOpen={!!recommendingProvider}
        provider={recommendingProvider}
        onClose={() => setRecommendingProvider(null)}
        onRecommendationSubmitted={handleRecommendationSubmitted}
      />
    </div>
  );
};
