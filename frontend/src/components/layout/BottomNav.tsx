import { Home, Store, HandHeart, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { NavigationTab } from '../../types';

interface NavItem {
  key: NavigationTab;
  label: string;
  icon: typeof Home;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Home },
  { key: 'servicios', label: 'Servicios', icon: Store },
  { key: 'solidaridad', label: 'Solidaridad', icon: HandHeart },
  { key: 'perfil', label: 'Perfil', icon: User },
];

export const BottomNav = () => {
  const { currentTab, setCurrentTab } = useApp();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 w-full bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-around sm:justify-center sm:gap-16">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = currentTab === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setCurrentTab(key)}
              className={`flex flex-col items-center gap-1 py-1 px-3 sm:px-6 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-extrabold sm:bg-blue-50/80'
                  : 'text-slate-400 font-medium hover:text-slate-700'
              }`}
            >
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="text-[11px] sm:text-xs tracking-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
