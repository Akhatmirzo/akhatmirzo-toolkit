import type { ReactNode } from 'react';
import { AdminShell } from '@/components/examples/admin/shell/admin-shell';

/** Do'kon admin paneli: sidebar + header qobig'i, ichki sahifalar `children` da */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
