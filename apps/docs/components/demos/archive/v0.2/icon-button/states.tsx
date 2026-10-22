'use client';

import { IconButton } from '@akhatmirzo/ui';
import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function IconButtonStates() {
  const [loading, setLoading] = useState(false);

  const download = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <IconButton
        variant="primary"
        loading={loading}
        onClick={download}
        aria-label="Hisobotni yuklab olish"
        labels={{ loading: 'Yuklab olinmoqda' }}
      >
        <Download />
      </IconButton>
      <IconButton variant="danger" disabled aria-label="O'chirish">
        <Trash2 />
      </IconButton>
    </div>
  );
}
