import type { Metadata } from 'next';
import { SignUpFlow } from '@/components/examples/auth/sign-up-flow';

export const metadata: Metadata = {
  title: "Ro'yxatdan o'tish",
  description: "Ko'p bosqichli ro'yxatdan o'tish: telefon va SMS kod, shaxsiy ma'lumotlar, parol.",
};

export default function SignUpPage() {
  return <SignUpFlow />;
}
