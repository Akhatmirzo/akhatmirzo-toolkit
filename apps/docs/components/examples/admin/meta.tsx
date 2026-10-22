import { Badge, type BadgeColor } from '@akhatmirzo/ui';
import {
  Apple,
  Baby,
  Shirt,
  Footprints,
  Smartphone,
  Sofa,
  Sparkles,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId, OrderStatus, PaymentMethod } from './data';

/** Buyurtma holatlari: nom va rang */
export const STATUS_META: Record<OrderStatus, { label: string; color: BadgeColor }> = {
  new: { label: 'Yangi', color: 'info' },
  processing: { label: "Yig'ilmoqda", color: 'warning' },
  shipped: { label: "Yo'lda", color: 'primary' },
  delivered: { label: 'Yetkazildi', color: 'success' },
  cancelled: { label: 'Bekor qilindi', color: 'danger' },
};

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  click: 'Click',
  payme: 'Payme',
  uzcard: 'Uzcard',
  humo: 'Humo',
  cash: 'Naqd pul',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge color={meta.color} dot>
      {meta.label}
    </Badge>
  );
}

export const CATEGORY_ICON: Record<CategoryId, LucideIcon> = {
  electronics: Smartphone,
  appliances: WashingMachine,
  clothing: Shirt,
  shoes: Footprints,
  beauty: Sparkles,
  home: Sofa,
  kids: Baby,
  food: Apple,
};

/** Rasm bo'lmaganda — toifa ikonkasi yumshoq rangli fonda */
const CATEGORY_TONE: Record<CategoryId, string> = {
  electronics: 'bg-primary-soft text-primary-soft-foreground',
  appliances: 'bg-info-soft text-info-soft-foreground',
  clothing: 'bg-danger-soft text-danger-soft-foreground',
  shoes: 'bg-warning-soft text-warning-soft-foreground',
  beauty: 'bg-danger-soft text-danger-soft-foreground',
  home: 'bg-success-soft text-success-soft-foreground',
  kids: 'bg-info-soft text-info-soft-foreground',
  food: 'bg-success-soft text-success-soft-foreground',
};

export function ProductThumb({
  category,
  image,
  name,
  className = 'size-10 rounded-lg',
  iconClassName = 'size-5',
}: {
  category: CategoryId;
  image?: string;
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  if (image) {
    // data: URL — next/image kerak emas
    return <img src={image} alt={name} className={`${className} shrink-0 object-cover`} />;
  }
  const Icon = CATEGORY_ICON[category];
  return (
    <span
      aria-hidden="true"
      className={`${className} ${CATEGORY_TONE[category]} grid shrink-0 place-items-center`}
    >
      <Icon className={iconClassName} strokeWidth={1.75} />
    </span>
  );
}
