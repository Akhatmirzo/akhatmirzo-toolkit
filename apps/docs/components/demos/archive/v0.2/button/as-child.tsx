'use client';

import { Button } from '@akhatmirzo/ui';
import { ArrowRight } from 'lucide-react';

export default function ButtonAsChild() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button asChild variant="outline" rightIcon={<ArrowRight />}>
        <a href="#accessibility">Accessibility bo'limiga</a>
      </Button>
      <Button asChild variant="link">
        <a href="https://github.com/Akhatmirzo/akhatmirzo-toolkit">GitHub</a>
      </Button>
    </div>
  );
}
