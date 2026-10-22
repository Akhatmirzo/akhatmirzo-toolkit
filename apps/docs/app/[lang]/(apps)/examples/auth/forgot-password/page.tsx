import type { Metadata } from 'next';
import { ForgotPasswordFlow } from '@/components/examples/auth/forgot-password-flow';

export const metadata: Metadata = {
  title: 'Parolni tiklash',
  description: 'Telefon raqam, SMS kod va yangi parol orqali parolni tiklash.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordFlow />;
}
