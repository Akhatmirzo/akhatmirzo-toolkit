import { ForgotPasswordFlow } from '@/components/examples/auth/forgot-password-flow';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/auth/forgot-password'>) {
  return exampleMetadata(params, 'auth/forgot-password');
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}
