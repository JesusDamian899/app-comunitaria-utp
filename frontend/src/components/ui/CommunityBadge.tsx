import { Award, Trophy, Medal, Crown } from 'lucide-react';
import type { CommunityStatusLevel } from '../../types';

interface CommunityBadgeProps {
  level: CommunityStatusLevel;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIconOnly?: boolean;
}

export const CommunityBadge = ({
  level,
  size = 'sm',
  showIconOnly = false,
}: CommunityBadgeProps) => {
  const config = {
    bronce: {
      label: 'Bronce',
      fullLabel: 'Nivel Bronce (1 - 4 favores)',
      icon: Award,
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-bold',
      iconClass: 'text-amber-700',
    },
    plata: {
      label: 'Plata',
      fullLabel: 'Nivel Plata (5 - 9 favores)',
      icon: Medal,
      badgeClass: 'bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs font-bold',
      iconClass: 'text-slate-600',
    },
    oro: {
      label: 'Oro',
      fullLabel: 'Nivel Oro (10 - 19 favores)',
      icon: Trophy,
      badgeClass: 'bg-yellow-100 text-yellow-900 border border-yellow-400 shadow-2xs font-extrabold',
      iconClass: 'text-amber-500 fill-amber-400',
    },
    heroe_del_barrio: {
      label: 'Héroe del barrio',
      fullLabel: 'Héroe del barrio (20+ favores)',
      icon: Crown,
      badgeClass: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 border border-amber-300 shadow-xs font-black tracking-wide',
      iconClass: 'text-slate-950 fill-amber-300',
    },
  }[level];

  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5 gap-1 rounded-sm',
    sm: 'text-[10px] px-2 py-0.5 gap-1 rounded-md',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-lg',
    lg: 'text-sm px-3.5 py-1.5 gap-2 rounded-xl font-bold',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      className={`inline-flex items-center shrink-0 uppercase transition-transform select-none ${config.badgeClass} ${sizeClasses}`}
      title={config.fullLabel}
    >
      <Icon className={`${iconSizes} ${config.iconClass} shrink-0`} />
      {!showIconOnly && <span>{config.label}</span>}
    </span>
  );
};
