import { Suspense } from 'react';
import { CardsView } from '@/components/examples/bank/cards/cards-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank/cards'>) {
  return exampleMetadata(params, 'bank/cards');
}

export default function CardsPage() {
  // useSearchParams (?add=1) uchun Suspense chegarasi
  return (
    <Suspense>
      <CardsView />
    </Suspense>
  );
}
