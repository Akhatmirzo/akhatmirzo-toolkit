import type { Metadata } from 'next';
import { AnalyticsView } from '@/components/examples/bank/analytics-view';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Tahlil — Bank ilovasi', description: 'Xarajatlar toifalar va oylar kesimida.' };
}

export default function AnalyticsPage() {
  return <AnalyticsView />;
}
