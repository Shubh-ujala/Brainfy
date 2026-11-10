import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }) => (
  <div className={cn('shimmer rounded-md bg-muted', className)} {...props} />
);

export { Skeleton };

