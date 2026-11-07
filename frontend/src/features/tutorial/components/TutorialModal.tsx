import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MODULE_TUTORIALS, type TutorialModuleKey } from '../data/tutorialSteps';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal = ({ isOpen, onClose }: TutorialModalProps) => {
  const { activeTutorialModule, selectTutorialModule } = useApp();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Reiniciar al primer paso cuando cambia el módulo
  useEffect(() => {
    setCurrentStepIndex(0);
  }, [activeTutorialModule]);

  if (!isOpen) return null;

  const currentModuleData = MODULE_TUTORIALS[activeTutorialModule] || MODULE_TUTORIALS.inicio;
  const steps = currentModuleData.steps;
  const currentStep = steps[currentStepIndex] || steps[0];
  const StepIcon = currentStep.icon;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Barra superior con selector de módulos */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 bg-slate-50/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
                Guía Rápida • {currentModuleData.headerTitle}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Pestañas / Módulos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(Object.keys(MODULE_TUTORIALS) as TutorialModuleKey[]).map((key) => {
              const mod = MODULE_TUTORIALS[key];
              const isSelected = activeTutorialModule === key;
              const ModIcon = mod.icon;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectTutorialModule(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ModIcon className="w-3.5 h-3.5" />
                  <span>{mod.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido Dinámico del Paso Activo */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Cabecera del Módulo */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${currentModuleData.accentGradient} text-white flex items-center justify-center shadow-md shadow-blue-950/20`}
            >
              <StepIcon className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                Paso {currentStepIndex + 1} de {steps.length} • {currentModuleData.label}
              </span>
              <h4 className="text-lg sm:text-xl font-black text-slate-900 pt-0.5">
                {currentStep.title}
              </h4>
            </div>
          </div>

          {/* Explicación didáctica */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-center font-medium max-w-md mx-auto">
            {currentStep.description}
          </p>

          {/* Ubicación en la pantalla */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Cómo encontrarlo en la pantalla:</span>
            </div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <span>{currentStep.highlightText}</span>
            </p>
          </div>
        </div>

        {/* Barra de Navegación Inferior */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-3">
          {/* Indicador de Puntos */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentStepIndex === idx
                    ? 'w-5 h-2 bg-[#172554]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Ir al paso ${idx + 1}`}
              />
            ))}
          </div>

          {/* Botones Anterior / Siguiente */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Atrás</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95 ${
                isLastStep
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
                  : 'bg-[#172554] hover:bg-blue-900 text-white shadow-blue-950/20'
              }`}
            >
              <span>{isLastStep ? '¡Entendido!' : 'Siguiente'}</span>
              {isLastStep ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
