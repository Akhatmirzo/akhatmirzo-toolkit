import type { Metadata } from 'next';
import { CartStep } from '@/components/examples/checkout/cart-step';
import { checkoutMetadata } from '@/components/examples/checkout/meta';

export async function generateMetadata(): Promise<Metadata> {
  return checkoutMetadata('Savatcha');
}

export default function Page() {
  return <CartStep />;
}
