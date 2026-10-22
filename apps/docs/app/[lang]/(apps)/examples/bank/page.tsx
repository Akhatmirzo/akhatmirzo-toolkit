import type { Metadata } from 'next';
import { HomeView } from '@/components/examples/bank/home-view';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Bank ilovasi', description: "Kartalar, balans va so'nggi operatsiyalar." };
}

export default function BankHomePage() {
  return <HomeView />;
}
