import { ProfilePage } from '@/components/examples/workspace/profile/profile-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/workspace/profile'>) {
  return exampleMetadata(params, 'workspace/profile');
}

export default function Page() {
  return <ProfilePage />;
}
