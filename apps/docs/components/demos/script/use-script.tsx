'use client';

import { Button, ScriptProvider, ScriptToggle, useScript } from '@akhatmirzo/ui';

function Cart() {
  const { script, t } = useScript();
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-text-muted">
        script: <code>{script}</code>
      </p>
      <Button variant="primary">{t('Savatga qoʻshish')}</Button>
      <input
        className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-text"
        placeholder={t('Mahsulot qidirish')}
        aria-label={t('Mahsulot qidirish')}
      />
    </div>
  );
}

export default function UseScriptDemo() {
  return (
    <ScriptProvider defaultScript="cyrillic">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <ScriptToggle />
        <Cart />
      </div>
    </ScriptProvider>
  );
}
