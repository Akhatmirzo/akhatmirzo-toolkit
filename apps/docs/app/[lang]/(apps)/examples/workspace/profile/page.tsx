import type { Metadata } from 'next';
import { ProfilePage } from '@/components/examples/workspace/profile/profile-page';

export const metadata: Metadata = {
  title: 'Profil — Xodimlar va sozlamalar',
  description: 'Profil sozlamalari: rasm, ism, bio, til va vaqt mintaqasi.',
};

export default function Page() {
  return <ProfilePage />;
}
