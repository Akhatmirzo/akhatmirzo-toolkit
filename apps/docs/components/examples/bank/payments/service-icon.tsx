import { cn } from '@akhatmirzo/ui';
import {
  Droplets,
  FileText,
  Flame,
  Globe,
  Landmark,
  ShieldAlert,
  Smartphone,
  Trash2,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { PaymentService, ServiceGroup } from '../data';

const icons: Record<string, LucideIcon> = {
  mobile: Smartphone,
  electricity: Zap,
  gas: Flame,
  water: Droplets,
  waste: Trash2,
  fines: ShieldAlert,
  tax: Landmark,
  duty: FileText,
};

export const groupTone: Record<ServiceGroup, string> = {
  mobile: 'bg-primary-soft text-primary-soft-foreground',
  internet: 'bg-info-soft text-info-soft-foreground',
  utilities: 'bg-warning-soft text-warning-soft-foreground',
  government: 'bg-success-soft text-success-soft-foreground',
};

export function ServiceIcon({
  service,
  className,
}: {
  service: PaymentService;
  className?: string;
}) {
  const Icon = icons[service.id] ?? Globe;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl [&_svg]:size-5',
        groupTone[service.group],
        className,
      )}
    >
      <Icon />
    </span>
  );
}
