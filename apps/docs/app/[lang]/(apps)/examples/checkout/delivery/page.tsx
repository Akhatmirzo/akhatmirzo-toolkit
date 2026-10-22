import { DeliveryStep } from '@/components/examples/checkout/delivery-step';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/checkout/delivery'>) {
  return exampleMetadata(params, 'checkout/delivery');
}

export default function Page() {
  return <DeliveryStep />;
}
