import type { Metadata } from 'next';
import { VerifyFlow } from '@/components/examples/auth/verify-flow';

export const metadata: Metadata = {
  title: 'SMS kodni tasdiqlash',
  description: 'OtpInput va ResendTimer bilan SMS kodni tasdiqlash.',
};

export default function VerifyPage() {
  return <VerifyFlow />;
}
