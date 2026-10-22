import type { Metadata } from 'next';
import { NotificationsPage } from '@/components/examples/workspace/notifications/notifications-page';

export const metadata: Metadata = {
  title: 'Bildirishnomalar — Xodimlar va sozlamalar',
  description: 'Bildirishnoma kanallari, hodisalar va jim soatlar.',
};

export default function Page() {
  return <NotificationsPage />;
}
