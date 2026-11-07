import {
  CheckCircle2,
  Utensils,
  Wrench,
  HeartPulse,
  ShoppingBag,
  FileText,
  Car,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import type { ServiceCategoryType } from '../../../types';

export type ServiceCategory = ServiceCategoryType;

interface ServiceCategoryChipsProps {
  selectedCategory: ServiceCategory;
  onSelectCategory: (cat: ServiceCategory) => void;
}

export const SERVICE_CATEGORIES: { id: ServiceCategory; label: string; icon: LucideIcon }[] = [
  { id: 'todos', label: 'Todos', icon: CheckCircle2 },
  { id: 'alimentacion', label: 'Alimentación', icon: Utensils },
  { id: 'mantenimiento_hogar', label: 'Mantenimiento y Hogar', icon: Wrench },
  { id: 'salud_bienestar', label: 'Salud y Bienestar', icon: HeartPulse },
  { id: 'compras_bazar', label: 'Compras y Bazar', icon: ShoppingBag },
  { id: 'servicios_tramites', label: 'Servicios y trámites', icon: FileText },
  { id: 'vehiculos_mascotas', label: 'Vehículos y Mascotas', icon: Car },
  { id: 'otros', label: 'Otros', icon: Sparkles },
];

export const ServiceCategoryChips = ({
  selectedCategory,
  onSelectCategory,
}: ServiceCategoryChipsProps) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
      {SERVICE_CATEGORIES.map(({ id, label, icon: Icon }) => {
        const isSelected = selectedCategory === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelectCategory(id)}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
              isSelected
                ? 'bg-[#172554] text-white border-[#172554] shadow-xs'
                : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};
