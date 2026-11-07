import { useState } from 'react';
import { X, ThumbsUp, Star, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { ServiceProvider, ServiceReview } from '../../../types';

interface RecommendModalProps {
  isOpen: boolean;
  provider: ServiceProvider | null;
  onClose: () => void;
  onRecommendationSubmitted: (providerId: string, updatedVistosBuenos: number, newReview?: ServiceReview) => void;
}

const QUICK_TAGS = [
  'Puntual y muy limpio el trabajo.',
  'Solucionó la urgencia con rapidez.',
  'Excelente tarifa y trato vecinal.',
  'Muy profesional y de total confianza.',
];

export const RecommendModal = ({
  isOpen,
  provider,
  onClose,
  onRecommendationSubmitted,
}: RecommendModalProps) => {
  const { showToast } = useApp();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>(QUICK_TAGS[0]);

  if (!isOpen || !provider) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVistosBuenos = provider.recommendationsCount + 1;

    const newReview: ServiceReview = {
      id: `rev-${Date.now()}`,
      author: CURRENT_USER.name,
      unit: `${CURRENT_USER.portal}, ${CURRENT_USER.apartment}`,
      comment: comment || 'Vecino 100% recomendado.',
      rating,
    };

    onRecommendationSubmitted(provider.id, newVistosBuenos, newReview);
    showToast(`¡Visto bueno otorgado a ${provider.name} (+1 Visto Bueno)!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <ThumbsUp className="w-4 h-4 fill-blue-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Dar Visto Bueno Vecinal
              </h3>
              <p className="text-[11px] text-slate-400">
                Modelo perfiles.vistos_buenos (+1)
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

        {/* Formulario de Recomendación (Regla de 3 clics) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Datos del Profesional */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={provider.avatarUrl}
              alt={provider.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-100 shrink-0"
            />
            <div>
              <h4 className="font-extrabold text-sm text-slate-900">{provider.name}</h4>
              <p className="text-xs text-slate-500 font-medium">{provider.role}</p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{provider.recommendationsCount} Vistos Buenos actuales</span>
              </div>
            </div>
          </div>

          {/* Clic 1: Calificación de estrellas */}
          <div className="space-y-1 text-center py-1">
            <label className="text-xs font-bold text-slate-700">
              Calificación de calidad
            </label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Clic 2: Reseña rápida con chips de un solo clic */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Opinión vecinal (1 clic para elegir)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setComment(tag)}
                  className={`text-xs px-2.5 py-1 rounded-xl border transition-all text-left cursor-pointer ${
                    comment === tag
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  "{tag}"
                </button>
              ))}
            </div>
          </div>

          {/* Clic 3: Confirmación directa */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md shadow-blue-900/20 cursor-pointer transition-all"
            >
              <ThumbsUp className="w-4 h-4 fill-white" />
              <span>Confirmar Visto Bueno (+1)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
