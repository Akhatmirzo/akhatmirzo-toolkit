import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TransferView } from '@/components/examples/bank/transfer/transfer-view';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "O'tkazma — Bank ilovasi",
    description: "Karta yoki telefon raqami bo'yicha o'tkazma.",
  };
}

export default function TransferPage() {
  // useSearchParams (?to=) uchun Suspense chegarasi
  return (
    <Suspense>
      <TransferView />
    </Suspense>
  );
}
