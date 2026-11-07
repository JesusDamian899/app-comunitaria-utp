export type SolidaridadFilter = 'todos' | 'necesito' | 'brindo';

interface SolidaridadFilterTabsProps {
  activeFilter: SolidaridadFilter;
  onFilterChange: (filter: SolidaridadFilter) => void;
}

const TABS: { id: SolidaridadFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'necesito', label: 'Necesito ayuda' },
  { id: 'brindo', label: 'Brindo Ayuda' },
];

export const SolidaridadFilterTabs = ({
  activeFilter,
  onFilterChange,
}: SolidaridadFilterTabsProps) => {
  return (
    <div className="grid grid-cols-3 gap-1 bg-slate-200/70 p-1 rounded-xl">
      {TABS.map(({ id, label }) => {
        const isActive = activeFilter === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`py-2 px-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'bg-[#172554] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
