import { useState } from 'react';
import { X, Wrench, Sprout, Users, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { SolidaridadFavor } from '../../../types';

interface CreateFavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFavorCreated: (newFavor: SolidaridadFavor) => void;
}

const TIPO_SOLICITUDES = [
  {
    id: 'prestamo',
    label: 'Ofrecer Préstamo',
    tag: 'Préstamo disponible',
    actionText: 'Pedir prestado',
    icon: Wrench,
    iconName: 'wrench' as const,
  },
  {
    id: 'peticion',
    label: 'Pedir Ayuda / Favor',
    tag: 'Petición solidaria',
    actionText: 'Ofrecer ayuda',
    icon: Sprout,
    iconName: 'plant' as const,
  },
  {
    id: 'acompanamiento',
    label: 'Acompañamiento',
    tag: 'Acompañamiento',
    actionText: 'Ofrecer apoyo',
    icon: Users,
    iconName: 'users' as const,
  },
];

const PRESET_TITLES = [
  'Escalera de aluminio tijera',
  'Taladro percutor con brocas',
  'Cuidado de plantas el fin de semana',
  'Acompañamiento a centro de salud',
  'Préstamo de mesa plegable y sillas',
];

export const CreateFavorModal = ({
  isOpen,
  onClose,
  onFavorCreated,
}: CreateFavorModalProps) => {
  const { showToast } = useApp();

  const [selectedTipo, setSelectedTipo] = useState<string>('prestamo');
  const [titulo, setTitulo] = useState<string>('');
  const [tiempo] = useState<string>('Hoy');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo.trim()) {
      showToast('Por favor escribe un título o selecciona una sugerencia.');
      return;
    }

    const currentTipoConfig = TIPO_SOLICITUDES.find((t) => t.id === selectedTipo) || TIPO_SOLICITUDES[0];

    // Nuevo registro alineado al modelo de datos muro_solidario
    const newFavor: SolidaridadFavor = {
      id: `fav-${Date.now()}`,
      type: (selectedTipo as 'prestamo' | 'peticion' | 'acompanamiento'),
      badgeTag: currentTipoConfig.tag,
      badgeTime: tiempo,
      title: titulo,
      ownerName: `${CURRENT_USER.name} (${CURRENT_USER.portal}, ${CURRENT_USER.apartment})`,
      location: `Publicado por ${CURRENT_USER.name} (${CURRENT_USER.apartment})`,
      actionButtonText: currentTipoConfig.actionText,
      iconName: currentTipoConfig.iconName,
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
              <p className="text-[11px] text-slate-400">
                Regla de 3 clics • Modelo muro_solidario
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

        {/* Formulario (Regla de los 3 clics) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Clic 1: Seleccionar Tipo de Solicitud (campo obligatorio en muro_solidario) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>1. Tipo de Solicitud</span>
              <span className="text-[10px] text-blue-600 font-semibold">Clic 1</span>
            </label>

            <div className="grid grid-cols-3 gap-1.5">
              {TIPO_SOLICITUDES.map(({ id, label, icon: Icon }) => {
                const isSelected = selectedTipo === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedTipo(id)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] leading-tight">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clic 2: ¿Qué necesitas o qué prestas? (con sugerencias de 1 toque) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>2. Descripción o artículo</span>
              <span className="text-[10px] text-slate-400">Clic 2 o escribe libremente</span>
            </label>

            {/* Sugerencias de 1 toque */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {PRESET_TITLES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTitulo(preset)}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Escalera de tijera, taladro, regar macetas..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Clic 3: Confirmación y Envío */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-950/20 cursor-pointer transition-all"
            >
              <span>3. Publicar en el Muro (1 Clic)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
