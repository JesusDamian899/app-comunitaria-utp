import { useState } from 'react';
import { X, Wrench, Zap, KeyRound, Paintbrush, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { ServiceProvider } from '../../../types';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated: (newService: ServiceProvider) => void;
}

const CATEGORIES = [
  { id: 'fontaneria', label: 'Fontanería', icon: Wrench },
  { id: 'electricidad', label: 'Electricidad', icon: Zap },
  { id: 'cerrajeria', label: 'Cerrajería', icon: KeyRound },
  { id: 'hogar', label: 'Hogar / Pintura', icon: Paintbrush },
];

const PRESET_DESCRIPTIONS = [
  'Instalación y reparaciones rápidas en el edificio.',
  'Diagnóstico sin costo vecinal y atención en el día.',
  'Disponibilidad fines de semana y urgencias menores.',
];

export const CreateServiceModal = ({
  isOpen,
  onClose,
  onServiceCreated,
}: CreateServiceModalProps) => {
  const { showToast } = useApp();

  // Estados alineados al modelo: categoria, descripcion, ubicacion
  const [categoria, setCategoria] = useState<string>('fontaneria');
  const [descripcion, setDescripcion] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>(
    `${CURRENT_USER.building}, ${CURRENT_USER.portal} (${CURRENT_USER.apartment})`
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Crear el nuevo objeto compatible con el modelo de datos (oficios_locales + perfiles)
    const newProvider: ServiceProvider = {
      id: `prov-${Date.now()}`,
      name: CURRENT_USER.name,
      experience: 'Vecino verificado',
      role: `${categoria.charAt(0).toUpperCase() + categoria.slice(1)} Vecinal`,
      location: ubicacion,
      avatarUrl: CURRENT_USER.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      recommendationsCount: 1, // Inicia con su propio visto bueno
      specialtyDetails: descripcion || 'Servicio ofrecido por vecino de la comunidad.',
      category: (categoria as 'fontaneria' | 'electricidad' | 'cerrajeria' | 'hogar'),
      reviews: [],
      phone: CURRENT_USER.phone,
    };

    onServiceCreated(newProvider);
    showToast('¡Servicio publicado con éxito en tu comunidad!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Publicar Servicio Local
              </h3>
              <p className="text-[11px] text-slate-400">
                Regla de 3 clics • Modelo oficios_locales
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario rápido (3 clics) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Clic 1: Selección de Categoría (obligatorio en oficios_locales) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>1. Categoría de oficio</span>
              <span className="text-[10px] text-blue-600 font-semibold">Clic 1</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(({ id, label, icon: Icon }) => {
                const isSelected = categoria === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategoria(id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clic 2: Descripción y etiquetas rápidas (descripcion en oficios_locales) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>2. Descripción del servicio</span>
              <span className="text-[10px] text-slate-400">Opcional o elige etiqueta</span>
            </label>

            {/* Chips de sugerencia rápida (1 toque) */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {PRESET_DESCRIPTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDescripcion(preset)}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                >
                  + {preset.substring(0, 32)}...
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Cambio de grifería, desatascos, enchufes y calderas. Tarifa vecinal."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Ubicación (campo obligatorio en oficios_locales) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Ubicación comunitaria</span>
            </label>
            <input
              type="text"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              placeholder="Portal y departamento"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          {/* Clic 3: Botón de Publicación directa */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer transition-all"
            >
              <span>3. Publicar Servicio Ahora</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
