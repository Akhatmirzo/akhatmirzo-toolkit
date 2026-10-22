import type { Metadata } from 'next';
import { SettingsPage } from '@/components/examples/admin/settings/settings-page';

export function generateMetadata(): Metadata {
  return {
    title: "Sozlamalar · Do'kon admin paneli",
    description:
      "Do'kon sozlamalari: umumiy ma'lumotlar, to'lov, yetkazib berish va bildirishnomalar.",
  };
}

export default function Page() {
  return <SettingsPage />;
}
