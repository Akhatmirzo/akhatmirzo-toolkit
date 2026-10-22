import { Suspense } from 'react';
import { TransferView } from '@/components/examples/bank/transfer/transfer-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank/transfer'>) {
  return exampleMetadata(params, 'bank/transfer');
}

export default function TransferPage() {
  // useSearchParams (?to=) uchun Suspense chegarasi
  return (
    <Suspense>
      <TransferView />
    </Suspense>
  );
}
