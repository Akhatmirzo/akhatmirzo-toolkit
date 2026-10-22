import { DashboardPage } from '@/components/examples/admin/dashboard/dashboard-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/admin'>) {
  return exampleMetadata(params, 'admin');
}

export default function Page() {
  return <DashboardPage />;
}
