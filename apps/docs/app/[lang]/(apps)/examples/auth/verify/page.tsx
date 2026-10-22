import { VerifyFlow } from '@/components/examples/auth/verify-flow';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/auth/verify'>) {
  return exampleMetadata(params, 'auth/verify');
}

export default function VerifyPage() {
  return <VerifyFlow />;
}
