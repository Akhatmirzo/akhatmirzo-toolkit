import { SettingsPage } from '@/components/examples/admin/settings/settings-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/admin/settings'>) {
  return exampleMetadata(params, 'admin/settings');
}

export default function Page() {
  return <SettingsPage />;
}
