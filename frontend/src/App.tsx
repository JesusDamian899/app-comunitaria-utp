import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { InicioScreen } from './features/inicio/InicioScreen';
import { ServiciosScreen } from './features/servicios/ServiciosScreen';
import { SosScreen } from './features/SOS/SosScreen';

function MainApp() {
  const { currentTab, isSosOpen, showToast } = useApp();

  // Si el usuario activa el botón de pánico SOS, mostramos la pantalla de emergencia
  if (isSosOpen) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        <SosScreen />
      </div>
    );
  }

  return (
    <AppLayout>
      {currentTab === 'inicio' && <InicioScreen />}
      {currentTab === 'servicios' && <ServiciosScreen />}
      {currentTab !== 'inicio' && currentTab !== 'servicios' && (
        <div className="py-16 px-4 text-center text-slate-500 space-y-3 max-w-md mx-auto">
          <div className="text-4xl">🚧</div>
          <h3 className="font-extrabold text-base text-slate-900 capitalize">
            Módulo {currentTab}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Los módulos de Inicio y Servicios ya están activos y responsivos. Diseñaremos esta pantalla con tus indicaciones paso a paso.
          </p>
          <button
            type="button"
            onClick={() => showToast(`Pestaña ${currentTab} seleccionada`)}
            className="px-4 py-2 bg-[#172554] text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-900 transition-colors shadow-xs"
          >
            Probar Interacción
          </button>
        </div>
      )}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
