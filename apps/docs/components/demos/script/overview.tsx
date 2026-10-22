'use client';

import { ScriptProvider, ScriptToggle, Translit } from '@akhatmirzo/ui';

export default function ScriptOverview() {
  return (
    <ScriptProvider defaultScript="latin">
      <div className="flex w-full max-w-md flex-col items-start gap-4">
        <ScriptToggle size="sm" />
        <Translit as="h3" className="text-lg font-semibold text-text">
          Oʻzbekiston boʻylab yetkazib berish
        </Translit>
        <Translit as="p" className="text-sm text-text-muted">
          Buyurtmangiz 2–3 kun ichida eshigingizgacha yetkaziladi. Toʻlov — naqd yoki karta orqali.
        </Translit>
      </div>
    </ScriptProvider>
  );
}
