import { Search } from 'lucide-react';

interface SearchServiceBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchServiceBar = ({ searchQuery, onSearchChange }: SearchServiceBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar fontanero, electricista, pintura..."
        className="w-full bg-white border border-slate-200/90 rounded-2xl pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
      />
    </div>
  );
};
