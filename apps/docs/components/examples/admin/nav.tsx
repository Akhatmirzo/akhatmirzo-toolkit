'use client';

import {
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback } from 'react';

export interface NavItem {
  /** Admin ichidagi yo'l: '' — bosh sahifa */
  path: string;
  label: string;
  icon: LucideIcon;
  keywords?: string[];
}

export const NAV_MAIN: NavItem[] = [
  { path: '', label: 'Bosh sahifa', icon: LayoutDashboard, keywords: ['dashboard', 'statistika'] },
  { path: 'orders', label: 'Buyurtmalar', icon: ShoppingBag, keywords: ['zakaz', 'savdo'] },
  {
    path: 'products',
    label: 'Mahsulotlar',
    icon: Package,
    keywords: ['tovar', 'katalog', 'ombor'],
  },
  { path: 'customers', label: 'Mijozlar', icon: Users, keywords: ['xaridor', 'klient'] },
];

export const NAV_SECONDARY: NavItem[] = [
  { path: 'settings', label: 'Sozlamalar', icon: Settings, keywords: ["do'kon", "to'lov"] },
];

/** `/uz/examples/admin/<path>` havolasini yasaydi */
export function useAdminHref() {
  const lang = String(useParams().lang ?? 'uz');
  return useCallback((path = '') => `/${lang}/examples/admin${path ? `/${path}` : ''}`, [lang]);
}
