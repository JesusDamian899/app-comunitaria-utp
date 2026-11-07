import { CheckCircle2, Wrench, Zap, KeyRound, Home } from 'lucide-react';

export type ServiceCategory = 'todos' | 'fontaneria' | 'electricidad' | 'cerrajeria' | 'hogar';

interface ServiceCategoryChipsProps {
  selectedCategory: ServiceCategory;
  onSelectCategory: (cat: ServiceCategory) => void;
}

const CATEGORIES: { id: ServiceCategory; label: string; icon: typeof CheckCircle2 }[] = [
  { id: 'todos', label: 'Todos', icon: CheckCircle2 },
  { id: 'fontaneria', label: 'Fontanería', icon: Wrench },
  { id: 'electricidad', label: 'Electricidad', icon: Zap },
  { id: 'cerrajeria', label: 'Cerrajería', icon: KeyRound },
  { id: 'hogar', label: 'Hogar', icon: Home },
];

export const ServiceCategoryChips = ({
  selectedCategory,
  onSelectCategory,
}: ServiceCategoryChipsProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
      {CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isSelected = selectedCategory === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectCategory(id)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
              isSelected
                ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
