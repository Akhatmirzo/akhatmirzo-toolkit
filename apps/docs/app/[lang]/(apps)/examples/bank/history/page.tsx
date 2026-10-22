import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HistoryView } from '@/components/examples/bank/history-view';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Tarix — Bank ilovasi',
    description: "Operatsiyalar tarixi: qidiruv, filtrlar va sanalar oralig'i.",
  };
}

export default function HistoryPage() {
  // useSearchParams (?card=) uchun Suspense chegarasi
  return (
    <Suspense>
      <HistoryView />
    </Suspense>
  );
}
