import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CardsView } from '@/components/examples/bank/cards/cards-view';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Kartalar — Bank ilovasi',
    description: "Karta qo'shish, bloklash va boshqarish.",
  };
}

export default function CardsPage() {
  // useSearchParams (?add=1) uchun Suspense chegarasi
  return (
    <Suspense>
      <CardsView />
    </Suspense>
  );
}
