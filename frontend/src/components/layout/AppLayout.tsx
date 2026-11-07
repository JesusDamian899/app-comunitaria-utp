import { type ReactNode } from 'react';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';
import { FloatingSosButton } from '../ui/FloatingSosButton';
import { Toast } from '../ui/Toast';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col">
      {/* Notificaciones flotantes */}
      <Toast />

      {/* Barra superior extendida a todo lo ancho de la pantalla */}
      <TopHeader />

      {/* Contenido principal: fluido, adaptativo a celular, tablet y escritorio */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
        {children}
      </main>

      {/* Botón flotante de emergencia SOS */}
      <FloatingSosButton />

      {/* Barra inferior de navegación: extendida y responsiva */}
      <BottomNav />
    </div>
  );
};
