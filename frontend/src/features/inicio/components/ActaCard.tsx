import { FileText } from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { MOCK_ACTA } from '../../../mock/data';

export const ActaCard = () => {
  const { showToast } = useApp();

  return (
    <div 
      onClick={() => showToast('Abriendo acta firmada de la última reunión')}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-2 cursor-pointer hover:border-slate-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 leading-tight">
              {MOCK_ACTA.authorName}
            </h4>
            <span className="text-[10px] text-slate-400">{MOCK_ACTA.authorRole}</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400">{MOCK_ACTA.timeAgo}</span>
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-xs text-slate-900">
          {MOCK_ACTA.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {MOCK_ACTA.previewText}
        </p>
      </div>
    </div>
  );
};
