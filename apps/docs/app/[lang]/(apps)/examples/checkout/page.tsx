import type { Metadata } from 'next';
import { ShopView } from '@/components/examples/checkout/shop-view';
import { checkoutMetadata } from '@/components/examples/checkout/meta';

export async function generateMetadata(): Promise<Metadata> {
  return checkoutMetadata();
}

export default function Page() {
  return <ShopView />;
}
