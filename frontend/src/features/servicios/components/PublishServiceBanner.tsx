import { Wrench, PlusCircle } from 'lucide-react';

interface PublishServiceBannerProps {
  onOpenPublish: () => void;
}

export const PublishServiceBanner = ({ onOpenPublish }: PublishServiceBannerProps) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5 shadow-2xs">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="space-y-0.5">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
            ¿Ofreces un servicio local?
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Conéctate con tus vecinos y colabora en el barrio.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenPublish}
        className="w-full py-2.5 sm:py-3 px-4 bg-[#172554] hover:bg-blue-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-[0.99]"
      >
        <PlusCircle className="w-4 h-4" />
        <span> Publicar servicio</span>
      </button>
    </div>
  );
};
