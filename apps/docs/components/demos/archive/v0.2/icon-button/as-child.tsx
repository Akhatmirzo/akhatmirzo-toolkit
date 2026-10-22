'use client';

import { IconButton } from '@akhatmirzo/ui';
import { Settings } from 'lucide-react';

export default function IconButtonAsChild() {
  return (
    <IconButton asChild variant="outline" aria-label="Sozlamalar">
      <a href="#props">
        <Settings />
      </a>
    </IconButton>
  );
}
