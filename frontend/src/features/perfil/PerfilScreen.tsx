import { ProfileHeader } from './components/ProfileHeader';
import { ProfileStats } from './components/ProfileStats';
import { VulnerabilityCard } from './components/VulnerabilityCard';
import { ProfileMenuList } from './components/ProfileMenuList';

export const PerfilScreen = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Título de la Sección */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Mi Perfil Vecinal
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Gestión de identidad, confianza y seguridad comunitaria
          </p>
        </div>
      </div>

      {/* Grid Responsivo: 1 columna en móvil, 2 columnas armoniosas en tablet y escritorio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        {/* Columna Izquierda: Datos del vecino, métricas y declaración de vulnerabilidad */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Cabecera del Perfil con nivel de confianza ganada */}
          <ProfileHeader vistosBuenosCount={18} />

          {/* Estadísticas de participación vecinal */}
          <ProfileStats
            vistosBuenos={18}
            favoresCount={7}
            asistenciaPorcentaje="100%"
          />

          {/* Tarjeta de Vulnerabilidad para motor_vulnerabilidad.py */}
          <VulnerabilityCard />
        </div>

        {/* Columna Derecha: Opciones y configuraciones de cuenta */}
        <div className="lg:col-span-1">
          <ProfileMenuList />
        </div>
      </div>
    </div>
  );
};
