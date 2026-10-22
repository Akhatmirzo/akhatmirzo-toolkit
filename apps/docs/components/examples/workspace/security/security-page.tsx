'use client';

import { PageHeader } from '../ui';
import { DangerZone } from './danger-zone';
import { PasswordSection } from './password-section';
import { SessionsSection } from './sessions-section';
import { TwoFactorSection } from './two-factor-section';

export function SecurityPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <PageHeader
        title="Xavfsizlik"
        description="Parol, ikki bosqichli himoya va hisobingizga kirgan qurilmalar."
      />
      <div className="flex flex-col gap-6">
        <PasswordSection />
        <TwoFactorSection />
        <SessionsSection />
        <DangerZone />
      </div>
    </div>
  );
}
