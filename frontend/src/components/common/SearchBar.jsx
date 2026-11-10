import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SearchBar = ({ value, onChange, placeholder = 'Search…', className = '', enableShortcut = true }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!enableShortcut) return;
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableShortcut]);

  return (
    <div className={cn('relative group', className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-foreground transition-colors" />
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-12 h-10 transition-shadow focus-visible:ring-1 focus-visible:ring-ring"
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground hover:text-foreground active:scale-90 transition-transform"
          aria-label="Clear search"
        >
          <X size={13} />
        </Button>
      ) : enableShortcut ? (
        <span className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground/70 bg-secondary border border-border/60 pointer-events-none">
          /
        </span>
      ) : null}
    </div>
  );
};

export default SearchBar;
