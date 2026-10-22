import { SignUpFlow } from '@/components/examples/auth/sign-up-flow';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/auth/sign-up'>) {
  return exampleMetadata(params, 'auth/sign-up');
}

export default function SignUpPage() {
  return <SignUpFlow />;
}
