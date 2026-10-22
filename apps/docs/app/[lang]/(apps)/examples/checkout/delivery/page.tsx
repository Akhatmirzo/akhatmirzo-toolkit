import type { Metadata } from 'next';
import { DeliveryStep } from '@/components/examples/checkout/delivery-step';
import { checkoutMetadata } from '@/components/examples/checkout/meta';

export async function generateMetadata(): Promise<Metadata> {
  return checkoutMetadata('Yetkazib berish');
}

export default function Page() {
  return <DeliveryStep />;
}
