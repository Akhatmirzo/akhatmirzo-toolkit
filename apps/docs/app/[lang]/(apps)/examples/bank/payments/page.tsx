import { PaymentsView } from '@/components/examples/bank/payments/payments-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank/payments'>) {
  return exampleMetadata(params, 'bank/payments');
}

export default function PaymentsPage() {
  return <PaymentsView />;
}
