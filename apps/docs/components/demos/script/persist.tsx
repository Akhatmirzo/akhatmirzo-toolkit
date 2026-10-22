'use client';

import { ScriptProvider, ScriptToggle, Translit } from '@akhatmirzo/ui';

export default function ScriptPersist() {
  return (
    <ScriptProvider defaultScript="latin" storageKey="docs-script-demo">
      <div className="flex flex-col items-start gap-3">
        <ScriptToggle labels={{ latin: 'Lotincha', cyrillic: 'Кириллча' }} />
        <Translit className="text-sm text-text-muted">
          Tanlovingiz eslab qolinadi — sahifani yangilab koʻring.
        </Translit>
      </div>
    </ScriptProvider>
  );
}
