import { NotificationsPage } from '@/components/examples/workspace/notifications/notifications-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({
  params,
}: PageProps<'/[lang]/examples/workspace/notifications'>) {
  return exampleMetadata(params, 'workspace/notifications');
}

export default function Page() {
  return <NotificationsPage />;
}
