import { SuccessView } from '@/components/examples/checkout/success-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/checkout/success'>) {
  return exampleMetadata(params, 'checkout/success');
}

export default function Page() {
  return <SuccessView />;
}
