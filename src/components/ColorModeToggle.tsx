import { Moon, Sun } from 'lucide-react';
import { useLegacyArchiveStore } from '../stores/useLegacyArchiveStore';

interface ColorModeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ColorModeToggle({ compact = false, className = '' }: ColorModeToggleProps) {
  const colorMode = useLegacyArchiveStore((s) => s.colorMode ?? 'dark');
  const toggleColorMode = useLegacyArchiveStore((s) => s.toggleColorMode);
  const isLight = colorMode === 'light';

  return (
    <button
      type="button"
      onClick={toggleColorMode}
      title={isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
      aria-label={isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng'}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-medium transition cursor-pointer ${
        compact ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-2 text-xs font-semibold'
      } ${className}`}
    >
      {isLight ? (
        <>
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Chế độ Tối</span>
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Chế độ Sáng</span>
        </>
      )}
    </button>
  );
}
