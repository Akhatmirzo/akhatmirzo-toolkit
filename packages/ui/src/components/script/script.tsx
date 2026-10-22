import { detectScript, toScript } from '@akhatmirzo/core';
import type { ComponentProps, ElementType } from 'react';
import { SegmentedControl, type SegmentedControlProps } from '../segmented-control';
import { scriptLang, useScriptContext, type UzScript } from './script-context';

/* ---------- Translit ---------- */

export interface TranslitProps extends Omit<ComponentProps<'span'>, 'children'> {
  /** O'giriladigan matn (lotin yoki kirill — manba avtomatik aniqlanadi) */
  children: string;
  /** Render qilinadigan element. Default `'span'` */
  as?: ElementType;
}

/**
 * Matnni `ScriptProvider` dagi joriy alifboda ko'rsatadi va elementga `lang="uz-Latn"` /
 * `lang="uz-Cyrl"` qo'yadi (ekran o'quvchi va SEO uchun). Provider bo'lmasa — matn o'zgarmaydi.
 * @example <h1><Translit>Oʻzbekiston boʻylab yetkazib berish</Translit></h1>
 */
export function Translit({ children, as: Comp = 'span', lang, ...props }: TranslitProps) {
  const ctx = useScriptContext();
  const text = ctx ? toScript(children, ctx.script) : children;
  let autoLang: string | undefined;
  if (ctx) autoLang = scriptLang(ctx.script);
  else {
    const detected = detectScript(children);
    if (detected === 'latin' || detected === 'cyrillic') autoLang = scriptLang(detected);
  }
  return (
    <Comp data-slot="translit" lang={lang ?? autoLang} {...props}>
      {text}
    </Comp>
  );
}

/* ---------- ScriptToggle ---------- */

export interface ScriptToggleLabels {
  /** Lotin tugmasi. Default `"Lotin"` */
  latin?: string;
  /** Kirill tugmasi. Default `"Кирилл"` */
  cyrillic?: string;
  /** Guruh nomi (`aria-label`). Default `"Alifbo"` */
  group?: string;
}

const defaultLabels: Required<ScriptToggleLabels> = {
  latin: 'Lotin',
  cyrillic: 'Кирилл',
  group: 'Alifbo',
};

export interface ScriptToggleProps extends Omit<
  SegmentedControlProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  /** Boshqariladigan qiymat. Berilmasa — `ScriptProvider` dagi alifbo */
  value?: UzScript;
  /** Provider ham, `value` ham bo'lmaganda boshlang'ich qiymat. Default `'latin'` */
  defaultValue?: UzScript;
  /** Tanlov o'zgarganda (provider bo'lsa — u ham yangilanadi) */
  onValueChange?: (script: UzScript) => void;
  labels?: ScriptToggleLabels;
}

/**
 * Lotin / kirill almashtirgich — `SegmentedControl` asosida. `ScriptProvider` ichida uning
 * holatini boshqaradi; tashqarida `value` / `onValueChange` bilan ishlaydi.
 * @example <ScriptToggle size="sm" />
 */
export function ScriptToggle({
  value,
  defaultValue = 'latin',
  onValueChange,
  labels,
  'aria-label': ariaLabel,
  ...props
}: ScriptToggleProps) {
  const ctx = useScriptContext();
  const text = { ...defaultLabels, ...labels };
  const current = value ?? ctx?.script;

  const handleChange = (next: string) => {
    if (next !== 'latin' && next !== 'cyrillic') return;
    ctx?.setScript(next);
    onValueChange?.(next);
  };

  return (
    <SegmentedControl
      data-slot="script-toggle"
      aria-label={ariaLabel ?? text.group}
      value={current}
      defaultValue={current === undefined ? defaultValue : undefined}
      onValueChange={handleChange}
      {...props}
    >
      <SegmentedControl.Item value="latin" lang="uz-Latn">
        {text.latin}
      </SegmentedControl.Item>
      <SegmentedControl.Item value="cyrillic" lang="uz-Cyrl">
        {text.cyrillic}
      </SegmentedControl.Item>
    </SegmentedControl>
  );
}
