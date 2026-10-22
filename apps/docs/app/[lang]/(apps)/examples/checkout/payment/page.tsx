import { PaymentStep } from '@/components/examples/checkout/payment-step';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/checkout/payment'>) {
  return exampleMetadata(params, 'checkout/payment');
}

export default function Page() {
  return <PaymentStep />;
}
