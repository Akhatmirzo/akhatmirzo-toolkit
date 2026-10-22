import { SignIn } from '@/components/examples/auth/sign-in-form';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/auth/sign-in'>) {
  return exampleMetadata(params, 'auth/sign-in');
}

export default function SignInPage() {
  return <SignIn />;
}
