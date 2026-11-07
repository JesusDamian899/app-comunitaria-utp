import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Star, CheckCircle2, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { ServiceProvider, ServiceReview } from '../../../types';

interface RecommendModalProps {
  isOpen: boolean;
  provider: ServiceProvider | null;
  onClose: () => void;
  onRecommendationSubmitted: (providerId: string, updatedVistosBuenos: number, newReview?: ServiceReview) => void;
}

const POSITIVE_TAGS = [
  'Puntual y muy limpio el trabajo.',
  'Solucionó la urgencia con rapidez.',
  'Tarifa justa y respetó lo acordado.',
  'Muy profesional y de total confianza.',
  '100% recomendado para la urbanización.',
];

const NEGATIVE_TAGS = [
  'Llegó con mucho retraso sin avisar.',
  'Cobró por encima de la tarifa acordada.',
  'Dejó el trabajo inconcluso o defectuoso.',
  'Falta de comunicación y mala disposición.',
  'No cumplió con lo pactado en la visita.',
];

export const RecommendModal = ({
  isOpen,
  provider,
  onClose,
  onRecommendationSubmitted,
}: RecommendModalProps) => {
  const { showToast } = useApp();

  // Paso 1: 'pin_validation' | Paso 2: 'rating_review'
  const [step, setStep] = useState<'pin_validation' | 'rating_review'>('pin_validation');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Estados del Paso 2 (Recomendación con Pulgar Arriba / Pulgar Abajo)
  const [recommendType, setRecommendType] = useState<'positivo' | 'negativo'>('positivo');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>(POSITIVE_TAGS[0]);

  if (!isOpen || !provider) return null;

  const expectedPin = provider.servicePin || '1234';

  const handleValidatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === expectedPin.trim()) {
      setPinError(null);
      setStep('rating_review');
      showToast('✓ PIN validado con éxito. Ahora puedes calificar el servicio.');
    } else {
      setPinError(`PIN incorrecto. Solicita a ${provider.name} el PIN de 4 dígitos que tiene en su perfil.`);
    }
  };

  const handleSelectRecommendType = (type: 'positivo' | 'negativo') => {
    setRecommendType(type);
    if (type === 'positivo') {
      setRating(5);
      setComment(POSITIVE_TAGS[0]);
    } else {
      setRating(1);
      setComment(NEGATIVE_TAGS[0]);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    const isPositivo = recommendType === 'positivo';
    const newVistosBuenos = isPositivo
      ? provider.recommendationsCount + 1
      : Math.max(0, provider.recommendationsCount - 1);

    const newReview: ServiceReview = {
      id: `rev-${Date.now()}`,
      author: CURRENT_USER.name,
      unit: `${CURRENT_USER.calle} ${CURRENT_USER.numero}`,
      comment: comment || (isPositivo ? 'Vecino 100% recomendado.' : 'Servicio con observaciones.'),
      rating: isPositivo ? rating : Math.min(2, rating),
    };

    onRecommendationSubmitted(provider.id, newVistosBuenos, newReview);
    showToast(
      isPositivo
        ? `¡Visto bueno otorgado a ${provider.name} (+1 Visto Bueno)!`
        : `Observación vecinal registrada sobre el servicio de ${provider.name}.`
    );

    // Resetear estados al cerrar
    setStep('pin_validation');
    setEnteredPin('');
    onClose();
  };

  const handleClose = () => {
    setStep('pin_validation');
    setEnteredPin('');
    setPinError(null);
    onClose();
  };

  const activeTags = recommendType === 'positivo' ? POSITIVE_TAGS : NEGATIVE_TAGS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              {step === 'pin_validation' ? (
                <KeyRound className="w-4 h-4 text-blue-700" />
              ) : (
                <ThumbsUp className="w-4 h-4 fill-blue-700" />
              )}
            </div>
            <div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PASO 1: VALIDACIÓN DE PIN DE 4 DÍGITOS */}
        {step === 'pin_validation' ? (
          <form onSubmit={handleValidatePin} className="p-5 sm:p-6 space-y-4">
            {/* Tarjeta del Proveedor */}
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
                  <span>{provider.recommendationsCount} Vistos Buenos en la urbanización</span>
                </div>
              </div>
            </div>

            {/* Explicación del PIN de 4 dígitos */}
            <div className="space-y-1.5 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                Ingresa el PIN de 4 dígitos del proveedor
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Para evitar recomendaciones falsas, solicita el PIN de 4 dígitos a <strong>{provider.name}</strong> al finalizar el servicio. El proveedor tiene este PIN visible en su <strong>Perfil</strong>.
              </p>
            </div>

            {/* Input de PIN */}
            <div className="space-y-2 pt-1">
              <div className="max-w-[200px] mx-auto">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  autoFocus
                  required
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value.replace(/\D/g, ''));
                    setPinError(null);
                  }}
                  placeholder="• • • •"
                  className="w-full text-center tracking-[0.5em] text-2xl font-black py-3 px-4 rounded-2xl border-2 border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 bg-slate-50 text-slate-900 focus:bg-white outline-hidden transition-all shadow-inner"
                />
              </div>

              {/* Mensaje de error si falla */}
              {pinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Insignia de demostración */}
              <div className="text-center pt-1">
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  PIN del proveedor para prueba: <strong className="text-slate-700">{expectedPin}</strong>
                </span>
              </div>
            </div>

            {/* Botón de Validación */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={enteredPin.length < 4}
                className={`w-full py-3 px-4 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all ${
                  enteredPin.length === 4
                    ? 'bg-[#172554] hover:bg-blue-900 cursor-pointer shadow-blue-900/20 active:scale-[0.99]'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Validar PIN y Calificar</span>
              </button>
            </div>
          </form>
        ) : (
          /* PASO 2: PULGAR ARRIBA 👍 Y PULGAR ABAJO 👎 CON COMENTARIOS PREDETERMINADOS */
          <form onSubmit={handleSubmitReview} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in">
            {/* Resumen del Servicio Validado */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Servicio validado con PIN de {provider.name}</span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded-md uppercase font-black">
                Verificado
              </span>
            </div>

            {/* Pulgar Arriba / Pulgar Abajo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800">
                ¿Recomiendas este trabajo a los vecinos?
              </label>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Botón Pulgar Arriba */}
                <button
                  type="button"
                  onClick={() => handleSelectRecommendType('positivo')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recommendType === 'positivo'
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 shadow-xs ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    recommendType === 'positivo' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ThumbsUp className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-black text-xs">Sí, lo recomiendo</span>
                  <span className="text-[10px] text-emerald-800 font-semibold">(Visto Bueno +1)</span>
                </button>

                {/* Botón Pulgar Abajo */}
                <button
                  type="button"
                  onClick={() => handleSelectRecommendType('negativo')}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    recommendType === 'negativo'
                      ? 'border-rose-600 bg-rose-50/80 text-rose-950 shadow-xs ring-2 ring-rose-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    recommendType === 'negativo' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <ThumbsDown className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-black text-xs">No lo recomiendo</span>
                  <span className="text-[10px] text-rose-800 font-semibold">(Con observaciones)</span>
                </button>
              </div>
            </div>

            {/* Estrellas */}
            <div className="space-y-1 text-center py-0.5">
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? recommendType === 'positivo'
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-rose-400 text-rose-400'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comentarios predeterminados según sea bueno o malo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>
                  {recommendType === 'positivo'
                    ? '¿Qué fue lo mejor? (1 clic para elegir)'
                    : '¿Qué problema hubo? (1 clic para elegir)'}
                </span>
                <span className={`text-[10px] font-bold ${recommendType === 'positivo' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  Predeterminado
                </span>
              </label>

              <div className="flex flex-wrap gap-1.5">
                {activeTags.map((tag, idx) => {
                  const isSelected = comment === tag;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setComment(tag)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? recommendType === 'positivo'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      "{tag}"
                    </button>
                  );
                })}
              </div>

              {/* Comentario personalizado */}
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Escribe un comentario adicional para los vecinos..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all mt-1"
              />
            </div>

            {/* Botón de Confirmación */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 px-4 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all ${
                  recommendType === 'positivo'
                    ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
                    : 'bg-rose-700 hover:bg-rose-800 shadow-rose-700/20'
                }`}
              >
                {recommendType === 'positivo' ? (
                  <>
                    <ThumbsUp className="w-4 h-4 fill-white" />
                    <span>Publicar Recomendación Positiva (+1)</span>
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4 fill-white" />
                    <span>Registrar Observación Vecinal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
