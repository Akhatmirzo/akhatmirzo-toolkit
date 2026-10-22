import { AnalyticsView } from '@/components/examples/bank/analytics-view';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/bank/analytics'>) {
  return exampleMetadata(params, 'bank/analytics');
}

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
