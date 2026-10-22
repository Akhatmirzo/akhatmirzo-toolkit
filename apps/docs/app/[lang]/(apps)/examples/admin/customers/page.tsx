import { CustomersPage } from '@/components/examples/admin/customers/customers-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/admin/customers'>) {
  return exampleMetadata(params, 'admin/customers');
}

export default function Page() {
  return <CustomersPage />;
}
