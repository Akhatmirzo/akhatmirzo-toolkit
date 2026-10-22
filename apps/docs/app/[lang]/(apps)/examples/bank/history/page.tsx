import { Suspense } from 'react';
import { HistoryView } from '@/components/examples/bank/history-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank/history'>) {
  return exampleMetadata(params, 'bank/history');
}

export default function HistoryPage() {
  // useSearchParams (?card=) uchun Suspense chegarasi
  return (
    <Suspense>
      <HistoryView />
    </Suspense>
  );
}
