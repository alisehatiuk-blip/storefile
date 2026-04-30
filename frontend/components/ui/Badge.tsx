import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';

interface BadgeProps {
  status: string;
  className?: string;
  label?: string;
}

export default function Badge({ status, className, label }: BadgeProps) {
  return (
    <span className={cn('badge', getStatusColor(status), className)}>
      {label || getStatusLabel(status)}
    </span>
  );
}
