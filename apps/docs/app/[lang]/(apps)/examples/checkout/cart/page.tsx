import { CartStep } from '@/components/examples/checkout/cart-step';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/checkout/cart'>) {
  return exampleMetadata(params, 'checkout/cart');
}

export default function Page() {
  return <CartStep />;
}
