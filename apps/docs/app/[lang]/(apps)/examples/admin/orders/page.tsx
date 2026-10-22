import type { Metadata } from 'next';
import { OrdersPage } from '@/components/examples/admin/orders/orders-page';

export function generateMetadata(): Metadata {
  return {
    title: "Buyurtmalar · Do'kon admin paneli",
    description:
      'Buyurtmalar jadvali: qidiruv, filtrlar, ommaviy amallar, CSV eksport va buyurtma tafsilotlari.',
  };
}

export default function Page() {
  return <OrdersPage />;
}
