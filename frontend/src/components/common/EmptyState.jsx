import { cn } from '@/lib/utils';

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4 rounded-xl border border-dashed border-border/80 bg-card/40', className)}>
    {Icon && (
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4 text-primary">
        <Icon size={24} />
      </div>
    )}
    <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
    {description && (
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-5">{description}</p>
    )}
    {action}
  </div>
);

export default EmptyState;

