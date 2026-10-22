'use client';

import { useSyncExternalStore } from 'react';

const SCALES = {
  indigo: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  slate: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
  emerald: ['50', '100', '300', '400', '500', '600', '700', '950'],
  amber: ['50', '100', '300', '400', '500', '600', '700', '950'],
  rose: ['50', '100', '300', '400', '500', '600', '700', '950'],
  sky: ['50', '100', '300', '400', '500', '600', '700', '950'],
};

const subscribe = () => () => {};
// CSS o'zgaruvchilarning haqiqiy qiymatlari (serverda — bo'sh)
const readValues = () => {
  const style = getComputedStyle(document.documentElement);
  return Object.entries(SCALES)
    .flatMap(([name, steps]) =>
      steps.map((s) => style.getPropertyValue(`--ak-${name}-${s}`).trim()),
    )
    .join(',');
};

export default function ThemingPalette() {
  const values = useSyncExternalStore(subscribe, readValues, () => '').split(',');
  let index = 0;

  return (
    <div className="flex w-full flex-col gap-5">
      {Object.entries(SCALES).map(([name, steps]) => (
        <div key={name} className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-text">{name}</span>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-11">
            {steps.map((step) => {
              const value = values[index++];
              return (
                <div key={step} className="flex flex-col gap-1">
                  <div
                    className="h-10 rounded-md border border-border"
                    style={{ background: `var(--ak-${name}-${step})` }}
                  />
                  <span className="text-xs font-medium text-text">{step}</span>
                  <span className="font-mono text-xs text-text-muted uppercase">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
