import type { Metadata } from 'next';
import { PaymentStep } from '@/components/examples/checkout/payment-step';
import { checkoutMetadata } from '@/components/examples/checkout/meta';

export async function generateMetadata(): Promise<Metadata> {
  return checkoutMetadata("To'lov");
}

export default function Page() {
  return <PaymentStep />;
}
