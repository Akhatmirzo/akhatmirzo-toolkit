import { TeamPage } from '@/components/examples/workspace/team/team-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/workspace'>) {
  return exampleMetadata(params, 'workspace');
}

export default function Page() {
  return <TeamPage />;
}
