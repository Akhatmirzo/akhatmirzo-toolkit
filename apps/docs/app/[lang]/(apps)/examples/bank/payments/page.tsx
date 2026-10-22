import type { Metadata } from 'next';
import { PaymentsView } from '@/components/examples/bank/payments/payments-view';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "To'lovlar — Bank ilovasi",
    description: 'Mobil aloqa, internet, kommunal va davlat xizmatlari.',
  };
}

export default function PaymentsPage() {
  return <PaymentsView />;
}
