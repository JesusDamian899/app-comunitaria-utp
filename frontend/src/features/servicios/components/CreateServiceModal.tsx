import { useState } from 'react';
import {
  X,
  Utensils,
  Wrench,
  HeartPulse,
  ShoppingBag,
  FileText,
  Car,
  Sparkles,
  MapPin,
  ShieldCheck,
  Hammer,
  UploadCloud,
  FileCheck,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { CURRENT_USER } from '../../../mock/data';
import type { ServiceProvider, ServiceCategoryType, TipoActividadServicio } from '../../../types';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceCreated?: (newService: ServiceProvider) => void;
  onServiceSubmittedPending?: (newService: ServiceProvider) => void;
}

const CATEGORIES: { id: ServiceCategoryType; label: string; icon: typeof Utensils }[] = [
  { id: 'alimentacion', label: 'Alimentación', icon: Utensils },
  { id: 'mantenimiento_hogar', label: 'Mantenimiento y Hogar', icon: Wrench },
  { id: 'salud_bienestar', label: 'Salud y Bienestar', icon: HeartPulse },
  { id: 'compras_bazar', label: 'Compras y Bazar', icon: ShoppingBag },
  { id: 'servicios_tramites', label: 'Servicios y trámites', icon: FileText },
  { id: 'vehiculos_mascotas', label: 'Vehículos y Mascotas', icon: Car },
  { id: 'otros', label: 'Otros', icon: Sparkles },
];

const PRESET_DESCRIPTIONS = [
  'Atención rápida en la urbanización con tarifa vecinal.',
  'Diagnóstico sin costo y disponibilidad inmediata.',
  'Atención a domicilio en todas las calles del sector.',
];

const TARIFA_MAXIMA_PERMITIDA = 300; // Límite solidario en soles acordado en la urbanización

export const CreateServiceModal = ({
  isOpen,
  onClose,
  onServiceCreated: _onServiceCreated,
  onServiceSubmittedPending,
}: CreateServiceModalProps) => {
  const { showToast } = useApp();

  const [tipoActividad, setTipoActividad] = useState<TipoActividadServicio>('oficio');
  const [archivoAcreditacion, setArchivoAcreditacion] = useState<string | null>(null);
  const [categoria, setCategoria] = useState<ServiceCategoryType>('mantenimiento_hogar');
  const [nombreServicio, setNombreServicio] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [tarifa, setTarifa] = useState<number>(45);
  const [ubicacion, setUbicacion] = useState<string>(
    `${CURRENT_USER.urbanizacion || 'Urb. Las Palmeras'} • ${CURRENT_USER.calle || 'Calle Los Sauces'} ${CURRENT_USER.numero || '420'}`
  );
  const [telefonoWhatsapp, setTelefonoWhatsapp] = useState<string>(CURRENT_USER.phone || '998765432');

  // Estado que conmuta la pantalla a "Esperando aprobación de administrador"
  const [isSubmittedPending, setIsSubmittedPending] = useState<boolean>(false);
  const [createdProviderCache, setCreatedProviderCache] = useState<ServiceProvider | null>(null);

  if (!isOpen) return null;

  const isExcedeLimiteTarifa = tarifa > TARIFA_MAXIMA_PERMITIDA;
  const isProfesion = tipoActividad === 'profesion';

  const handleSimularSubidaArchivo = () => {
    setArchivoAcreditacion('constancia_colegiatura_o_titulo.pdf (1.8 MB)');
    showToast('✓ Documento de acreditación adjuntado correctamente');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isExcedeLimiteTarifa) {
      showToast('⚠️ La tarifa propuesta supera el límite máximo permitido');
      return;
    }

    if (isProfesion && !archivoAcreditacion) {
      showToast('⚠️ Por favor adjunta tu documento de acreditación profesional');
      return;
    }

    const newProvider: ServiceProvider = {
      id: `prov-${Date.now()}`,
      name: CURRENT_USER.name,
      experience: 'Vecino de la zona',
      role: nombreServicio || (isProfesion ? 'Profesional Titulado' : 'Servicio Vecinal'),
      location: ubicacion,
      avatarUrl: CURRENT_USER.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      recommendationsCount: 1,
      specialtyDetails: `${descripcion || 'Servicio vecinal.'} (Tarifa vecinal: S/. ${tarifa})`,
      category: categoria,
      tipoActividad,
      verified: isProfesion, // Únicamente para personas con profesión
      reviews: [],
      phone: telefonoWhatsapp,
    };

    setCreatedProviderCache(newProvider);
    setIsSubmittedPending(true);
  };

  const handleFinishApproval = () => {
    if (createdProviderCache && onServiceSubmittedPending) {
      onServiceSubmittedPending(createdProviderCache);
    }
    showToast('Solicitud enviada a la administración. NO se publicará hasta ser validada.');
    setIsSubmittedPending(false);
    onClose();
  };

  const handleCloseModal = () => {
    setIsSubmittedPending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
                Publicar Servicio en la Urbanización
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PANTALLA 1: MENSAJE DE ESPERANDO APROBACIÓN DE ADMINISTRADOR */}
        {isSubmittedPending ? (
          <div className="p-6 sm:p-8 text-center space-y-4 animate-in fade-in">
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 pt-1">
                Esperando aprobación del administrador
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                Por seguridad de la comunidad, tu servicio <strong>no se publicará</strong> hasta que el administrador de la urbanización valide y confirme que el tarifario respeta el límite permitido.
              </p>
            </div>

            {/* Resumen de la solicitud enviada */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left text-slate-700 space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Servicio:</span>
                <span className="font-black text-slate-900">{nombreServicio}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Modalidad:</span>
                <span className="font-bold text-blue-800">
                  {isProfesion ? 'Profesión' : 'Oficio'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tarifa fijada:</span>
                <span className="font-bold text-emerald-700">S/. {tarifa}</span>
              </div>
              {isProfesion && archivoAcreditacion && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Documento adjunto:</span>
                  <span className="text-blue-700 font-semibold truncate max-w-[160px]">{archivoAcreditacion}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishApproval}
                className="w-full max-w-sm mx-auto py-3 px-4 bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl cursor-pointer shadow-md transition-all"
              >
             Entendido
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO DE REGISTRO */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* SELECCIÓN 1: ¿Es Profesión o es Oficio? */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Tipo de Actividad</span>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Opción A: Oficio */}
                <button
                  type="button"
                  onClick={() => setTipoActividad('oficio')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    tipoActividad === 'oficio'
                      ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-800 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-slate-900">
                    <Hammer className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Oficio</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight font-medium">
                    Avalado por los Vistos Buenos de los vecinos de la cuadra.
                  </p>
                </button>

                {/* Opción B: Profesión */}
                <button
                  type="button"
                  onClick={() => setTipoActividad('profesion')}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    tipoActividad === 'profesion'
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Profesión</span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1 leading-tight font-medium">
                    Requiere documento de acreditación oficial para mostrar la insignia.
                  </p>
                </button>
              </div>

              {/* REQUISITO: Pide documento de acreditación si es profesión */}
              {isProfesion && (
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2.5 animate-in fade-in">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-blue-700" />
                      <span>Documento de Acreditación Profesional</span>
                    </div>
                    <p className="text-[11px] text-blue-800/90 font-medium">
                      Adjunta tu título profesional o carnet de colegiatura para verificación del administrador.
                    </p>
                  </div>

                  {/* Botón de subir archivo de acreditación */}
                  <div>
                    {archivoAcreditacion ? (
                      <div className="flex items-center justify-between p-2.5 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold">
                        <span className="truncate max-w-[220px]">✓ {archivoAcreditacion}</span>
                        <button
                          type="button"
                          onClick={() => setArchivoAcreditacion(null)}
                          className="text-xs text-rose-600 hover:underline cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSimularSubidaArchivo}
                        className="w-full p-3 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-xl bg-white text-blue-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Adjuntar documento (PDF o Foto de Colegiatura)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SELECCIÓN 2: Categorías Oficiales */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Categoría</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const isSelected = categoria === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategoria(id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nombre o Título del Servicio */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                Nombre o Título del Servicio
              </label>
              <input
                type="text"
                required
                value={nombreServicio}
                onChange={(e) => setNombreServicio(e.target.value)}
                placeholder="Ej: Gasfitero de Emergencia / Lic. en Enfermería / Menú Casero"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* REQUISITO: TARIFARIO CON LÍMITE */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  Tarifario Vecinal Propuesto (S/.)
                </label>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Tope Máximo Comunitario: S/. {TARIFA_MAXIMA_PERMITIDA}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">S/.</span>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    required
                    value={tarifa}
                    onChange={(e) => setTarifa(Number(e.target.value))}
                    className={`w-full pl-8 pr-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      isExcedeLimiteTarifa
                        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:ring-blue-600'
                    }`}
                  />
                </div>
              </div>

              {isExcedeLimiteTarifa && (
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>
                    La tarifa supera el límite permitido de S/. {TARIFA_MAXIMA_PERMITIDA}. Ajusta el valor para poder enviar la solicitud.
                  </span>
                </div>
              )}
            </div>

            {/* Descripción y sugerencias rápidas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Descripción del servicio</span>
              </label>

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
                placeholder="Detalla lo que ofreces, horarios y si das facilidades vecinales."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Ubicación en la Urbanización */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Ubicación en la Urbanización (Calle y número)</span>
              </label>
              <input
                type="text"
                value={ubicacion}
                onChange={(e) => setUbicacion(e.target.value)}
                placeholder="Ej: Calle Los Sauces 420 • Mz. B Lte. 14"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white"
              />
            </div>

            {/* WhatsApp de Contacto */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Número de WhatsApp para contacto vecinal</span>
              </label>
              <input
                type="tel"
                required
                value={telefonoWhatsapp}
                onChange={(e) => setTelefonoWhatsapp(e.target.value)}
                placeholder="Ej: 998765432"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white"
              />
            </div>

            {/* Botón de Publicación */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isExcedeLimiteTarifa}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition-all ${
                  isExcedeLimiteTarifa
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-[#172554] hover:bg-blue-900 active:scale-[0.99] text-white shadow-blue-900/20 cursor-pointer'
                }`}
              >
                <span>Enviar para Aprobación de Administrador</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
