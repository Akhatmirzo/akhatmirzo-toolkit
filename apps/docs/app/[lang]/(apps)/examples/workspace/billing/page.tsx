import { BillingPage } from '@/components/examples/workspace/billing/billing-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/workspace/billing'>) {
  return exampleMetadata(params, 'workspace/billing');
}

export default function Page() {
  return <BillingPage />;
}
