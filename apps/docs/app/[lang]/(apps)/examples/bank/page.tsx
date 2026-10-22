import { HomeView } from '@/components/examples/bank/home-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank'>) {
  return exampleMetadata(params, 'bank');
}

export default function BankHomePage() {
  return <HomeView />;
}
