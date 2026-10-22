import { ShopView } from '@/components/examples/checkout/shop-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/checkout'>) {
  return exampleMetadata(params, 'checkout');
}

export default function Page() {
  return <ShopView />;
}
