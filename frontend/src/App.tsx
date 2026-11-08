import { AppProvider, useApp } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';
import { InicioScreen } from './features/inicio/InicioScreen';
import { ServiciosScreen } from './features/servicios/ServiciosScreen';
import { SolidaridadScreen } from './features/solidaridad/SolidaridadScreen';
import { PerfilScreen } from './features/perfil/PerfilScreen';
import { SosScreen } from './features/SOS/SosScreen';
import { TutorialModal } from './features/tutorial/components/TutorialModal';
import { AuthGuard } from './features/auth/AuthGuard';
function MainApp() {
  const { currentTab, isSosOpen, isTutorialOpen, closeTutorial } = useApp();

  return (
    <>
      {/* Modal del Tutorial interactivo por módulo */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
      />

      {/* Si el usuario activa el botón de pánico SOS, mostramos la pantalla de emergencia */}
      {isSosOpen ? (
        <div className="min-h-screen w-full bg-[#f8fafc] p-4 sm:p-6 lg:p-10 flex items-center justify-center">
          <SosScreen />
        </div>
      ) : (
        <AppLayout>
          {currentTab === 'inicio' && <InicioScreen />}
          {currentTab === 'servicios' && <ServiciosScreen />}
          {currentTab === 'solidaridad' && <SolidaridadScreen />}
          {currentTab === 'perfil' && <PerfilScreen />}
        </AppLayout>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthGuard>
        <MainApp />
      </AuthGuard>
    </AppProvider>
  );
}

