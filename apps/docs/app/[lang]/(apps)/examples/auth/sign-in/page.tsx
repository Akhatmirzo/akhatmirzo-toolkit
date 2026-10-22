import type { Metadata } from 'next';
import { SignIn } from '@/components/examples/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Kirish',
  description:
    'Telefon raqam yoki email bilan kirish: validatsiya, bloklash taymeri, SMS tasdiqlash.',
};

export default function SignInPage() {
  return <SignIn />;
}
