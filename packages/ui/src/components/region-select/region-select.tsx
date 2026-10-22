import { UZ_REGIONS, latToCyr, type UzRegion, type UzRegionId } from '@akhatmirzo/core';
import { useMemo } from 'react';
import { useScriptContext, type UzScript } from '../script/script-context';
import { Select, SelectItem, type SelectProps } from '../select';

export interface RegionSelectProps extends Omit<
  SelectProps,
  'value' | 'defaultValue' | 'onValueChange' | 'children'
> {
  /** Tanlangan hudud `id` si (`UZ_REGIONS` dan), masalan `'samarkand'` */
  value?: UzRegionId;
  defaultValue?: UzRegionId;
  onValueChange?: (id: UzRegionId, region: UzRegion) => void;
  /** Nomlar alifbosi. Default — `ScriptProvider` dagi yoki `'latin'` */
  script?: UzScript;
  /** Toshkent shahrini ham ko'rsatish. Default `true` */
  includeCity?: boolean;
}

/** Hudud nomi berilgan alifboda */
export function regionName(region: UzRegion, script: UzScript): string {
  return script === 'cyrillic' ? region.nameCyr : region.name;
}

/**
 * O'zbekiston hududlari (`UZ_REGIONS`): Qoraqalpogʻiston Respublikasi, 12 viloyat va
 * Toshkent shahri. `Select` preseti — qiymat hudud `id` si, nomlar joriy alifboda.
 * @example <RegionSelect value={region} onValueChange={setRegion} />
 */
export function RegionSelect({
  value,
  defaultValue,
  onValueChange,
  script: scriptProp,
  includeCity = true,
  placeholder,
  ...props
}: RegionSelectProps) {
  const ctx = useScriptContext();
  const script = scriptProp ?? ctx?.script ?? 'latin';
  const regions = useMemo(
    () => (includeCity ? UZ_REGIONS : UZ_REGIONS.filter((r) => r.id !== 'tashkent-city')),
    [includeCity],
  );
  const defaultPlaceholder = 'Hududni tanlang';

  const handleChange = (id: string) => {
    const region = UZ_REGIONS.find((r) => r.id === id);
    if (region) onValueChange?.(region.id, region);
  };

  return (
    <Select
      data-slot="region-select"
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleChange}
      placeholder={
        placeholder ?? (script === 'cyrillic' ? latToCyr(defaultPlaceholder) : defaultPlaceholder)
      }
      {...props}
    >
      {regions.map((r) => (
        <SelectItem key={r.id} value={r.id} lang={script === 'cyrillic' ? 'uz-Cyrl' : 'uz-Latn'}>
          {regionName(r, script)}
        </SelectItem>
      ))}
    </Select>
  );
}
