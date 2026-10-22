import type { Metadata } from 'next';
import { CustomersPage } from '@/components/examples/admin/customers/customers-page';

export function generateMetadata(): Metadata {
  return {
    title: "Mijozlar · Do'kon admin paneli",
    description: "Mijozlar ro'yxati, xaridlar tarixi va mijoz kartasi.",
  };
}

export default function Page() {
  return <CustomersPage />;
}
