import { useSyncExternalStore } from 'react';
import { DEFAULT_SLUG } from './pages';

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getSlug() {
  return window.location.hash.replace(/^#\/?/, '') || DEFAULT_SLUG;
}

/** Hash marshrut: #/button → "button" */
export function useSlug() {
  return useSyncExternalStore(subscribe, getSlug, () => DEFAULT_SLUG);
}

export function hrefFor(slug: string) {
  return `#/${slug}`;
}
