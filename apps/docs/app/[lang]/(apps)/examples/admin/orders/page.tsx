import { OrdersPage } from '@/components/examples/admin/orders/orders-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/admin/orders'>) {
  return exampleMetadata(params, 'admin/orders');
}

export default function Page() {
  return <OrdersPage />;
}
