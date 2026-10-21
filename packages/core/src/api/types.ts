// core DOM tiplarisiz yig'iladi, shuning uchun fetch uchun minimal strukturaviy tiplar.

/** Ichki foydalanish uchun minimal `AbortSignal` shakli. */
export interface MinimalAbortSignal {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: () => void, options?: { once?: boolean }): void;
  removeEventListener(type: 'abort', listener: () => void): void;
}

/** DOM tiplari mavjud bo'lsa — haqiqiy `AbortSignal`, aks holda minimal shakl. */
export type AbortSignalLike = typeof globalThis extends { AbortSignal: { prototype: infer S } }
  ? S
  : MinimalAbortSignal;

export interface FetchInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignalLike;
}

export interface FetchResponse {
  readonly ok: boolean;
  readonly status: number;
  readonly headers: { get(name: string): string | null };
  text(): Promise<string>;
}

/** `fetch` bilan mos funksiya tipi. */
export type FetchLike = (url: string, init: FetchInit) => Promise<FetchResponse>;
