import { normalizeUz } from '@akhatmirzo/core';
import { useControllableState } from '@akhatmirzo/hooks';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cva } from 'class-variance-authority';
import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { cn } from '../../lib/cn';
import { useFloatingLayer } from '../../lib/modal-layer';
import { floatingPanel, listItem } from '../../lib/overlay-styles';
import { assignRef } from '../../lib/refs';
import { Badge } from '../badge/badge';
import { useFieldControl } from '../field/field';
import { controlContainerBase, controlElementBase } from '../input/control-styles';

export type TagInputSize = 'sm' | 'md' | 'lg';

export interface TagInputLabels {
  /** Tegdagi ✕ tugmasi: `(tag) => "React ni olib tashlash"` */
  remove?: (tag: string) => string;
  /** Takliflar ro'yxatining nomi */
  suggestions?: string;
  /** Ekran o'quvchi uchun e'lon: teg qo'shildi */
  added?: (tag: string) => string;
  /** Ekran o'quvchi uchun e'lon: teg olib tashlandi */
  removed?: (tag: string) => string;
  /** `validate` `false` qaytarganda ko'rsatiladigan xato */
  invalid?: (tag: string) => string;
  /** Takroriy teg xatosi */
  duplicate?: (tag: string) => string;
}

const defaultLabels: Required<TagInputLabels> = {
  remove: (tag) => `${tag} ni olib tashlash`,
  suggestions: 'Takliflar',
  added: (tag) => `${tag} qo'shildi`,
  removed: (tag) => `${tag} olib tashlandi`,
  invalid: (tag) => `«${tag}» qabul qilinmadi`,
  duplicate: (tag) => `«${tag}» allaqachon qo'shilgan`,
};

export interface TagInputProps extends Omit<
  ComponentProps<'input'>,
  'value' | 'defaultValue' | 'size' | 'type' | 'name' | 'children'
> {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /**
   * Tegni yakunlovchi tugmalar / belgilar. Default `['Enter', ',']`; `'Tab'` ham qo'shish mumkin.
   * Bir belgili ajratuvchilar paste'da ham ishlaydi (`"a, b, c"` → 3 teg).
   */
  delimiters?: string[];
  /** Eng ko'p teglar soni — yetganda input yashiriladi (`data-full`) */
  maxTags?: number;
  /** Takroriy teglar (katta-kichik harf farqsiz taqqoslanadi). Default `false` */
  allowDuplicates?: boolean;
  /** `false` yoki xato matni — teg qo'shilmaydi, xato input ostida chiqadi */
  validate?: (tag: string) => boolean | string;
  /** Kiritilgan matnni tegga aylantirish. Default — `trim` */
  transform?: (raw: string) => string;
  /** Yozishda chiqadigan takliflar (kirill/lotin farqsiz qidiriladi) */
  suggestions?: string[];
  /** Minimal balandlik 32 / 40 / 48px — teglar ko'paysa o'sadi */
  size?: TagInputSize;
  /** Xato holati (Field ichida `error` bo'lsa avtomatik) */
  invalid?: boolean;
  /** Forma uchun: har bir tegga shu nomli yashirin `<input>` */
  name?: string;
  labels?: TagInputLabels;
  /** Ichki `<input>` klassi (`className` — ildiz konteynerga) */
  inputClassName?: string;
}

const containerVariants = cva([controlContainerBase, 'cursor-text flex-wrap items-center gap-1'], {
  variants: {
    size: {
      sm: 'min-h-8 py-0.5 pr-2.5 pl-1 text-sm',
      md: 'min-h-10 py-1 pr-3 pl-1.5 text-sm',
      lg: 'min-h-12 py-1.5 pr-4 pl-2 text-base',
    },
  },
  defaultVariants: { size: 'md' },
});

const inputSize: Record<TagInputSize, string> = {
  sm: 'h-6 px-1.5',
  md: 'h-7 px-1.5',
  lg: 'h-8 px-2',
};

const editSize: Record<TagInputSize, string> = {
  sm: 'h-5 text-xs',
  md: 'h-5 text-xs',
  lg: 'h-6 text-sm',
};

const defaultTransform = (raw: string) => raw.trim();
const lower = (s: string) => s.toLocaleLowerCase();

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Ajratuvchilardan paste / yozish uchun regex: `Enter` → yangi qator, `Tab` → tab belgisi */
function delimiterPattern(delimiters: string[]): RegExp | null {
  const parts = delimiters
    .map((d) => (d === 'Enter' ? '\\r?\\n' : d === 'Tab' ? '\\t' : d.length === 1 ? d : null))
    .filter((d): d is string => d !== null)
    .map((d) => (d.startsWith('\\') ? d : escapeRegExp(d)));
  return parts.length > 0 ? new RegExp(parts.join('|')) : null;
}

type Rejection = { tag: string; message: string };

/**
 * Teglar / kalit so'zlar / email ro'yxatini kiritish. `Enter` yoki vergul bilan qo'shiladi,
 * paste'da bo'linadi, bo'sh inputda `Backspace` — oxirgi teg tanlanadi, ikkinchisi o'chiradi;
 * `←/→` teglar orasida yuradi, teg ustiga ikki bosish — tahrirlash.
 * `Field` ichida label va izoh avtomatik ulanadi.
 * @example
 * <Field label="Teglar" description="Enter yoki vergul bilan qo'shing">
 *   <TagInput value={tags} onValueChange={setTags} placeholder="Teg qo'shing" />
 * </Field>
 * <TagInput suggestions={['React', 'Next.js', 'Tailwind']} maxTags={5} />
 * <TagInput validate={isValidEmail} placeholder="Email qo'shing" />
 */
export function TagInput({
  value: valueProp,
  defaultValue,
  onValueChange,
  delimiters = ['Enter', ','],
  maxTags,
  allowDuplicates = false,
  validate,
  transform = defaultTransform,
  suggestions,
  size = 'md',
  invalid: invalidProp,
  name,
  labels,
  className,
  inputClassName,
  id,
  disabled: disabledProp,
  required: requiredProp,
  readOnly = false,
  placeholder,
  ref,
  onChange,
  onKeyDown,
  onPaste,
  onBlur,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ...props
}: TagInputProps) {
  const field = useFieldControl({
    id,
    invalid: invalidProp,
    required: requiredProp,
    disabled: disabledProp,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  });
  const { disabled } = field;
  const text = { ...defaultLabels, ...labels };
  const layer = useFloatingLayer();

  const [tagsState, setTags] = useControllableState<string[]>({
    value: valueProp,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const tags = tagsState;

  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const baseId = useId();
  const errorId = `${baseId}-error`;
  const listId = `${baseId}-list`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const setInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  const full = maxTags !== undefined && tags.length >= maxTags;
  const interactive = !disabled && !readOnly;
  const invalid = field.invalid || error !== null;
  const pattern = delimiterPattern(delimiters);

  /* ---------- Qo'shish / o'chirish ---------- */

  const isDuplicate = (tag: string, list: string[], skip = -1) =>
    !allowDuplicates && list.some((t, i) => i !== skip && lower(t) === lower(tag));

  /** Bitta tegni tekshiradi: `null` — qabul, aks holda rad etish sababi */
  const check = (tag: string, list: string[], skip = -1): Rejection | null => {
    if (isDuplicate(tag, list, skip)) return { tag, message: text.duplicate(tag) };
    if (validate) {
      const result = validate(tag);
      if (result === false) return { tag, message: text.invalid(tag) };
      if (typeof result === 'string') return { tag, message: result };
    }
    return null;
  };

  /** Bir nechta xom matnni qo'shadi; rad etilganlarni qaytaradi */
  const addTags = (raws: string[]): Rejection[] => {
    const next = [...tags];
    const added: string[] = [];
    const rejected: Rejection[] = [];
    for (const raw of raws) {
      const tag = transform(raw);
      if (!tag) continue;
      if (maxTags !== undefined && next.length >= maxTags) break;
      const rejection = check(tag, next);
      if (rejection) {
        rejected.push(rejection);
        continue;
      }
      next.push(tag);
      added.push(tag);
    }
    if (added.length > 0) {
      setTags(next);
      setAnnouncement(added.map(text.added).join(', '));
    }
    setError(rejected[0]?.message ?? null);
    return rejected;
  };

  const removeAt = (index: number) => {
    const tag = tags[index];
    if (tag === undefined) return;
    setTags(tags.filter((_, i) => i !== index));
    setAnnouncement(text.removed(tag));
    setError(null);
  };

  const replaceAt = (index: number, raw: string): boolean => {
    const tag = transform(raw);
    if (!tag) {
      removeAt(index);
      return true;
    }
    if (tag === tags[index]) return true;
    const rejection = check(tag, tags, index);
    if (rejection) {
      setError(rejection.message);
      return false;
    }
    setTags(tags.map((t, i) => (i === index ? tag : t)));
    setAnnouncement(text.added(tag));
    setError(null);
    return true;
  };

  /* ---------- Takliflar ---------- */

  const trimmedQuery = query.trim();
  const filtered = (() => {
    if (!suggestions || suggestions.length === 0) return [];
    const q = normalizeUz(trimmedQuery);
    const taken = new Set(allowDuplicates ? [] : tags.map(lower));
    return suggestions.filter((s) => !taken.has(lower(s)) && normalizeUz(s).includes(q));
  })();
  const showList = listOpen && interactive && !full && filtered.length > 0;
  const activeOption = showList && highlight >= 0 ? filtered[highlight] : undefined;

  const closeList = () => {
    setListOpen(false);
    setHighlight(-1);
  };

  const pickSuggestion = (suggestion: string) => {
    const rejected = addTags([suggestion]);
    if (rejected.length === 0) setQuery('');
    closeList();
    inputRef.current?.focus();
  };

  /* ---------- Fokus ---------- */

  const focusTag = (index: number) =>
    containerRef.current?.querySelector<HTMLElement>(`[data-tag-index="${index}"]`)?.focus();
  const focusInput = () => inputRef.current?.focus();

  // O'chirish / tahrirdan keyin fokus — DOM yangilangach qo'yiladi
  const pendingFocus = useRef<number | 'input' | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (target === null) return;
    pendingFocus.current = null;
    if (target === 'input') focusInput();
    else focusTag(target);
  });

  /* ---------- Input hodisalari ---------- */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const next = e.target.value;
    setError(null);
    // Mobil klaviaturalar `keydown` da belgini bermaydi — bir belgili ajratuvchilar shu yerda
    if (pattern && pattern.test(next)) {
      const parts = next.split(pattern);
      const rest = parts.pop() ?? '';
      const rejected = addTags(parts);
      setQuery(rejected.map((r) => r.tag).join(', ') + rest);
    } else {
      setQuery(next);
    }
    setListOpen(true);
    setHighlight(-1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    onPaste?.(e);
    if (e.defaultPrevented || !interactive || full) return;
    const pasted = e.clipboardData.getData('text');
    if (!pattern || !pattern.test(pasted)) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart ?? query.length;
    const end = el.selectionEnd ?? query.length;
    const combined = query.slice(0, start) + pasted + query.slice(end);
    // Paste — oxirgi bo'lak ham teg bo'ladi
    const rejected = addTags(combined.split(pattern));
    setQuery(rejected.map((r) => r.tag).join(', '));
    closeList();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || !interactive || e.nativeEvent.isComposing) return;
    const el = e.currentTarget;
    const atStart = el.selectionStart === 0 && el.selectionEnd === 0;

    if (showList && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const n = filtered.length;
      setHighlight((h) => (e.key === 'ArrowDown' ? (h + 1) % n : h <= 0 ? n - 1 : h - 1));
      return;
    }
    if (e.key === 'ArrowDown' && suggestions?.length && !full) {
      e.preventDefault();
      setListOpen(true);
      setHighlight(0);
      return;
    }
    if (e.key === 'Escape' && showList) {
      e.preventDefault();
      closeList();
      return;
    }
    if (e.key === 'Enter' && activeOption !== undefined) {
      e.preventDefault();
      pickSuggestion(activeOption);
      return;
    }
    if (delimiters.includes(e.key) && (e.key.length > 1 || e.key === 'Enter')) {
      // `Enter` / `Tab`: bo'sh inputda Enter forma yuborishiga, Tab fokusga xalaqit bermaydi
      if (trimmedQuery === '' || full) return;
      e.preventDefault();
      const rejected = addTags([query]);
      if (rejected.length === 0) setQuery('');
      closeList();
      return;
    }
    if (e.key === 'Backspace' && query === '' && tags.length > 0) {
      e.preventDefault();
      focusTag(tags.length - 1);
      return;
    }
    if (e.key === 'ArrowLeft' && atStart && tags.length > 0) {
      e.preventDefault();
      focusTag(tags.length - 1);
    }
  };

  /* ---------- Teg hodisalari ---------- */

  const handleTagKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    if (!interactive || e.target !== e.currentTarget) return;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        if (index > 0) focusTag(index - 1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (index < tags.length - 1) focusTag(index + 1);
        else focusInput();
        break;
      case 'Home':
        e.preventDefault();
        focusTag(0);
        break;
      case 'End':
        e.preventDefault();
        focusInput();
        break;
      case 'Backspace':
      case 'Delete': {
        e.preventDefault();
        removeAt(index);
        const remaining = tags.length - 1;
        // Backspace — input'ga (yoki oldingi tegga ←), Delete — keyingi tegga
        if (e.key === 'Delete' && index < remaining) pendingFocus.current = index;
        else pendingFocus.current = 'input';
        break;
      }
      case 'Enter':
      case 'F2':
        e.preventDefault();
        setEditing(index);
        break;
      case 'Escape':
        e.preventDefault();
        focusInput();
        break;
      default:
        // Harf yozilsa — input'ga qaytib davom etadi
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) focusInput();
    }
  };

  const handleContainerMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (disabled || target === inputRef.current) return;
    if (target.closest('button, input, [data-tag-index]')) return;
    e.preventDefault();
    focusInput();
  };

  const finishEdit = (index: number, raw: string, refocus: boolean) => {
    if (!replaceAt(index, raw)) return false;
    setEditing(null);
    if (refocus) pendingFocus.current = 'input';
    return true;
  };

  const describedBy =
    [field.controlProps['aria-describedby'], error ? errorId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div
      data-slot="tag-input-root"
      className={cn('flex w-full min-w-0 flex-col gap-1.5 font-sans', className)}
    >
      <PopoverPrimitive.Root open={showList} onOpenChange={(o) => !o && closeList()}>
        <PopoverPrimitive.Anchor asChild>
          <div
            ref={containerRef}
            data-slot="tag-input"
            data-size={size}
            data-invalid={invalid ? '' : undefined}
            data-disabled={disabled ? '' : undefined}
            data-readonly={readOnly ? '' : undefined}
            data-full={full ? '' : undefined}
            className={containerVariants({ size })}
            onMouseDown={handleContainerMouseDown}
          >
            {tags.length > 0 && (
              <ul role="list" className="contents">
                {tags.map((tag, index) => (
                  <li key={`${tag}-${index}`} className="flex max-w-full min-w-0">
                    {editing === index ? (
                      <TagEditor
                        initial={tag}
                        className={editSize[size]}
                        onCommit={(raw, refocus) => finishEdit(index, raw, refocus)}
                        onCancel={() => {
                          setEditing(null);
                          setError(null);
                          pendingFocus.current = index;
                        }}
                      />
                    ) : (
                      <Badge
                        variant="soft"
                        color="neutral"
                        tabIndex={-1}
                        data-tag-index={index}
                        className={cn(
                          'max-w-full cursor-default outline-none select-none',
                          'focus-visible:bg-primary-soft focus-visible:text-primary-soft-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
                          size === 'lg' && 'py-0.5 text-sm',
                        )}
                        onKeyDown={(e) => handleTagKeyDown(e, index)}
                        onDoubleClick={() => interactive && setEditing(index)}
                        onRemove={
                          interactive
                            ? (e) => {
                                e.stopPropagation();
                                removeAt(index);
                                focusInput();
                              }
                            : undefined
                        }
                        labels={{ remove: text.remove(tag) }}
                      >
                        {tag}
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <input
              ref={setInputRef}
              type="text"
              role={suggestions ? 'combobox' : undefined}
              aria-autocomplete={suggestions ? 'list' : undefined}
              aria-expanded={suggestions ? showList : undefined}
              aria-controls={showList ? listId : undefined}
              aria-activedescendant={
                activeOption !== undefined ? `${listId}-${highlight}` : undefined
              }
              autoComplete="off"
              disabled={disabled}
              readOnly={readOnly || full}
              aria-readonly={full || undefined}
              required={requiredProp && tags.length === 0}
              placeholder={tags.length === 0 ? placeholder : undefined}
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={(e) => {
                onBlur?.(e);
                closeList();
              }}
              className={cn(
                controlElementBase,
                inputSize[size],
                'min-w-20',
                full && 'pointer-events-none absolute size-px min-w-0 p-0 opacity-0',
                inputClassName,
              )}
              {...field.controlProps}
              aria-invalid={invalid || undefined}
              aria-describedby={describedBy}
              {...props}
            />
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            data-slot="tag-input-suggestions"
            align="start"
            sideOffset={6}
            collisionPadding={8}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (containerRef.current?.contains(e.target as Node)) e.preventDefault();
            }}
            className={cn(
              floatingPanel,
              layer,
              'w-(--radix-popover-trigger-width) min-w-(--radix-popover-trigger-width)',
            )}
          >
            <ul
              id={listId}
              role="listbox"
              aria-label={text.suggestions}
              className="m-0 max-h-60 list-none overflow-y-auto overscroll-contain p-0"
            >
              {filtered.map((suggestion, i) => (
                <li
                  key={suggestion}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === highlight}
                  data-highlighted={i === highlight ? '' : undefined}
                  className={listItem}
                  // Fokus input'da qoladi
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseMove={() => setHighlight(i)}
                  onClick={() => pickSuggestion(suggestion)}
                >
                  <span className="truncate">{suggestion}</span>
                </li>
              ))}
            </ul>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {name &&
        tags.map((tag, i) => (
          <input key={`${tag}-${i}`} type="hidden" name={name} value={tag} disabled={disabled} />
        ))}

      {/* Xato — ko'rinadigan, live region doim DOM'da */}
      <div data-slot="tag-input-error" aria-live="polite" className="empty:hidden">
        {error && (
          <p id={errorId} className="m-0 text-xs text-danger-soft-foreground">
            {error}
          </p>
        )}
      </div>
      {/* Qo'shish / o'chirish e'lonlari — faqat ekran o'quvchi uchun */}
      <div data-slot="tag-input-status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

/* ---------- Tegni joyida tahrirlash ---------- */

interface TagEditorProps {
  initial: string;
  className?: string;
  /** `false` qaytarsa — tahrir davom etadi (xato) */
  onCommit: (raw: string, refocus: boolean) => boolean;
  onCancel: () => void;
}

function TagEditor({ initial, className, onCommit, onCancel }: TagEditorProps) {
  const [draft, setDraft] = useState(initial);
  const done = useRef(false);
  return (
    <input
      // Ikki bosishdan keyin darhol yozish uchun
      autoFocus
      type="text"
      value={draft}
      aria-label={initial}
      data-slot="tag-input-editor"
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        // IME (kompozitsiya) paytidagi Enter — belgini tasdiqlaydi, tegni emas
        if (e.nativeEvent.isComposing) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          if (onCommit(draft, true)) done.current = true;
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          done.current = true;
          onCancel();
        }
      }}
      onBlur={() => {
        if (!done.current && onCommit(draft, false)) done.current = true;
      }}
      className={cn(
        'min-w-12 rounded-full border border-primary bg-surface px-2 font-sans text-text outline-none [field-sizing:content]',
        className,
      )}
    />
  );
}
