import { toScript, type UzScript } from '@akhatmirzo/core';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

/** O'zbek alifbosi: lotin yoki kirill (`@akhatmirzo/core` dagi tur) */
export type { UzScript };

export interface ScriptContextValue {
  /** Joriy alifbo */
  script: UzScript;
  /** Alifboni almashtirish (`storageKey` bo'lsa — eslab qolinadi) */
  setScript: (script: UzScript) => void;
  /** Matnni joriy alifboga o'giradi (`toScript` ustida) */
  t: (text: string) => string;
}

const ScriptContext = createContext<ScriptContextValue | null>(null);

const isScript = (v: unknown): v is UzScript => v === 'latin' || v === 'cyrillic';

function readStorage(key: string): UzScript | null {
  try {
    const v = window.localStorage.getItem(key);
    return isScript(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: UzScript) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Saqlash taqiqlangan (private rejim, kvota) — tanlov faqat shu sessiyada qoladi
  }
}

export interface ScriptProviderProps {
  /** Boshqariladigan alifbo */
  script?: UzScript;
  /** Boshqarilmaydigan rejimdagi boshlang'ich alifbo. Default `'latin'` */
  defaultScript?: UzScript;
  onScriptChange?: (script: UzScript) => void;
  /**
   * Tanlovni `localStorage` da shu kalit bilan eslab qolish. SSR'da `defaultScript` bilan
   * render qilinadi, saqlangan qiymat gidratatsiyadan keyin o'qiladi.
   */
  storageKey?: string;
  children?: ReactNode;
}

/**
 * Ilova kontentini foydalanuvchi tanlagan alifboda ko'rsatish uchun kontekst.
 * Ichida `Translit`, `ScriptToggle`, `useScript`, `RegionSelect` va `MoneyInput showWords` ishlaydi.
 * @example
 * <ScriptProvider defaultScript="latin" storageKey="script">
 *   <ScriptToggle />
 *   <h1><Translit>Oʻzbekiston boʻylab yetkazib berish</Translit></h1>
 * </ScriptProvider>
 */
export function ScriptProvider({
  script: scriptProp,
  defaultScript = 'latin',
  onScriptChange,
  storageKey,
  children,
}: ScriptProviderProps) {
  const [inner, setInner] = useState<UzScript>(defaultScript);
  const controlled = scriptProp !== undefined;
  const script = controlled ? scriptProp : inner;

  const latest = useRef({ script, controlled, onScriptChange });
  // Effektlar tartibida birinchi — keyingi effekt yangi qiymatlarni ko'radi
  useEffect(() => {
    latest.current = { script, controlled, onScriptChange };
  });

  // Tashqi manbadan (localStorage, boshqa tab) kelgan qiymatni qabul qiladi
  const receive = useCallback((next: UzScript) => {
    const { script: current, controlled: isControlled, onScriptChange: notify } = latest.current;
    if (next === current) return;
    if (!isControlled) setInner(next);
    notify?.(next);
  }, []);

  // Gidratatsiyadan keyin saqlangan tanlovni o'qiymiz — SSR va birinchi render bir xil
  useEffect(() => {
    if (!storageKey) return;
    const stored = readStorage(storageKey);
    if (stored) receive(stored);
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && isScript(e.newValue)) receive(e.newValue);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey, receive]);

  const setScript = useCallback(
    (next: UzScript) => {
      if (storageKey) writeStorage(storageKey, next);
      receive(next);
    },
    [storageKey, receive],
  );

  const value = useMemo<ScriptContextValue>(
    () => ({ script, setScript, t: (text: string) => toScript(text, script) }),
    [script, setScript],
  );

  return <ScriptContext.Provider value={value}>{children}</ScriptContext.Provider>;
}

/** Provider bo'lmasa `null` (ichki foydalanish uchun) */
export function useScriptContext(): ScriptContextValue | null {
  return useContext(ScriptContext);
}

const fallback: ScriptContextValue = {
  script: 'latin',
  setScript: () => {},
  t: (text) => text,
};

/**
 * Joriy alifbo, uni almashtirish va matnni o'girish.
 * `ScriptProvider` tashqarisida: `script` — `'latin'`, `t` matnni o'zgartirmaydi.
 * @example
 * const { script, setScript, t } = useScript();
 * t('Salom'); // kirill tanlangan bo'lsa — "Салом"
 */
export function useScript(): ScriptContextValue {
  return useContext(ScriptContext) ?? fallback;
}

/** `lang` atributi qiymati: `uz-Latn` yoki `uz-Cyrl` */
export function scriptLang(script: UzScript): 'uz-Latn' | 'uz-Cyrl' {
  return script === 'cyrillic' ? 'uz-Cyrl' : 'uz-Latn';
}
