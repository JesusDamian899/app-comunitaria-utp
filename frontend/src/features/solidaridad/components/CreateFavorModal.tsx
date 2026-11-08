import { useState } from 'react';
import { X, Wrench, Gift, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { SolidaridadFavor, SolidaridadCategory } from '../../../types';

interface CreateFavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFavorCreated: (newFavor: SolidaridadFavor) => void;
}

const TIPO_SOLICITUDES = [
  {
    id: 'prestamo' as SolidaridadCategory,
    label: 'Préstamo',
    tag: 'Préstamo disponible',
    actionText: 'Pedir prestado',
    icon: Wrench,
    iconName: 'wrench' as const
  },
  {
    id: 'donacion' as SolidaridadCategory,
    label: 'Donación',
    tag: 'Donación solidaria',
    actionText: 'Solicitar donación',
    icon: Gift,
    iconName: 'gift' as const
  },
  {
    id: 'acompanamiento' as SolidaridadCategory,
    label: 'Acompañamiento',
    tag: 'Acompañamiento',
    actionText: 'Ofrecer apoyo',
    icon: Users,
    iconName: 'users' as const
  },
  {
    id: 'intercambio_habilidades' as SolidaridadCategory,
    label: 'Intercambio Habilidades',
    tag: 'Intercambio Habilidades',
    actionText: 'Intercambiar habilidad',
    icon: Sparkles,
    iconName: 'sparkles' as const
  },
];

export const CreateFavorModal = ({
  isOpen,
  onClose,
  onFavorCreated,
}: CreateFavorModalProps) => {
  const { showToast } = useApp();

  const [selectedTipo, setSelectedTipo] = useState<SolidaridadCategory>('prestamo');
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [tiempo] = useState<string>('Hoy');

  if (!isOpen) return null;

  const currentTipoConfig =
    TIPO_SOLICITUDES.find((t) => t.id === selectedTipo) || TIPO_SOLICITUDES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      showToast('Por favor escribe un título o selecciona una sugerencia.');
      return;
    }

    // Nuevo registro en Muro Solidario
    const newFavor: SolidaridadFavor = {
      id: `fav-${Date.now()}`,
      type: selectedTipo,
      categoria: selectedTipo,
      badgeTag: currentTipoConfig.tag,
      badgeTime: tiempo,
      title: titulo,
      description:
        descripcion.trim() ||
        `${titulo}. Disponible para vecinos de la comunidad. Coordinar entrega de forma directa.`,
      ownerName: CURRENT_USER.name,
      ownerAvatarUrl: CURRENT_USER.avatarUrl,
      location: `${CURRENT_USER.calle} ${CURRENT_USER.numero} (${CURRENT_USER.sector})`,
      actionButtonText: currentTipoConfig.actionText,
      iconName: currentTipoConfig.iconName,
      estado: 'disponible',
      donorBadgeLevel: 'plata',
    };

    onFavorCreated(newFavor);
    showToast('¡Publicación agregada con éxito al Muro Solidario!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Publicar en Muro Solidario
              </h3>
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

        {/* Formulario (Regla de los 3 clics) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Clic 1: Seleccionar Categoría (PRESTAMO, DONACION, ACOMPAÑAMIENTO, INTERCAMBIO HABILIDADES) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Categoría de Solidaridad</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              {TIPO_SOLICITUDES.map(({ id, label, icon: Icon }) => {
                const isSelected = selectedTipo === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedTipo(id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs leading-tight font-extrabold">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clic 2: ¿Qué necesitas o qué ofreces? */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Título del favor o artículo</span>
            </label>

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Escalera de tijera, taladro, libros de secundaria..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Descripción detallada opcional */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Descripción detallada</span>
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: En buen estado, se presta por 24 horas. Entrega en mano..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Clic 3: Confirmación y Envío */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 cursor-pointer transition-all"
            >
              <span>Publicar en el Muro</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
