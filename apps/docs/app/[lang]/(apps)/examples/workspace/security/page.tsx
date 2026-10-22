import { SecurityPage } from '@/components/examples/workspace/security/security-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/workspace/security'>) {
  return exampleMetadata(params, 'workspace/security');
}

export default function Page() {
  return <SecurityPage />;
}
