import type { Metadata } from 'next';
import { DashboardPage } from '@/components/examples/admin/dashboard/dashboard-page';

export function generateMetadata(): Metadata {
  return {
    title: "Bosh sahifa · Do'kon admin paneli",
    description:
      "Savdo statistikasi, grafiklar, eng ko'p sotilgan mahsulotlar va so'nggi buyurtmalar.",
  };
}

export default function Page() {
  return <DashboardPage />;
}
