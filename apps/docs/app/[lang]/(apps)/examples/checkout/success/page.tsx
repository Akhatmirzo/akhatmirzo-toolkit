import type { Metadata } from 'next';
import { SuccessView } from '@/components/examples/checkout/success-view';
import { checkoutMetadata } from '@/components/examples/checkout/meta';

export async function generateMetadata(): Promise<Metadata> {
  return checkoutMetadata('Buyurtma qabul qilindi');
}

export default function Page() {
  return <SuccessView />;
}
