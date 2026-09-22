import { Droplet } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const iconDims = { sm: 18, md: 22, lg: 30 };
  const textSize = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' };
  const subSize = { sm: 'text-[10px]', md: 'text-xs', lg: 'text-sm' };

  return (
    <div className="flex items-center gap-3">
      <div className={`${dims[size]} flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-md`}>
        <Droplet size={iconDims[size]} className="text-white" fill="white" />
      </div>
      <div>
        <div className={`font-bold leading-tight text-white ${textSize[size]}`}>
  Jeevan<span className="text-brand-500">Rakshak</span>
</div>
        <div className={`font-medium leading-tight text-navy-400 ${subSize[size]}`}>
          Predict. Coordinate. Save.
        </div>
      </div>
    </div>
  );
}
