/*
 * Modal qatlami konteksti (ichki): Dialog.Content va Drawer.Content ichida `true`.
 * Suzuvchi panellar (Select, Combobox, DropdownMenu, Popover) modal ichida bo'lsa,
 * `z-(--ak-z-dropdown)` o'rniga `modalLayerZIndex` ishlatadi — aks holda panel modal ortida qoladi.
 * Teng z-index'da keyin portal qilingan panel ustda turadi.
 */
import { createContext, useContext } from 'react';

export const ModalLayerContext = createContext(false);

/** Komponent Dialog / Drawer ichidami */
export function useInModalLayer() {
  return useContext(ModalLayerContext);
}

/** Modal ichidagi suzuvchi panel uchun z-index klassi */
export const modalLayerZIndex = 'z-(--ak-z-modal)';

/** Suzuvchi panel uchun qo'shimcha klass: modal ichida — `modalLayerZIndex`, aks holda yo'q */
export function useFloatingLayer() {
  return useInModalLayer() ? modalLayerZIndex : undefined;
}
