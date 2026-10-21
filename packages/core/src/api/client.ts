import { API_MESSAGES, ApiError, httpErrorMessage } from './api-error';
import type {
  AbortSignalLike,
  FetchInit,
  FetchLike,
  FetchResponse,
  MinimalAbortSignal,
} from './types';

type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface ApiClientOptions {
  /** Masalan `https://api.example.uz/v1` */
  baseUrl: string;
  /** Har so'rovda chaqiriladi; qiymat bo'lsa `Authorization: Bearer <token>` */
  getToken?: () => string | null | undefined | Promise<string | null | undefined>;
  /** ms, standart 15000; 0 — cheklovsiz */
  timeout?: number;
  /** Har so'rovga qo'shiladigan sarlavhalar */
  headers?: Record<string, string>;
  /** Standart — global `fetch` */
  fetch?: FetchLike;
}

export interface RequestOptions {
  /** `undefined` va `null` qiymatlar tashlab yuboriladi; massiv — takroriy kalit */
  query?: QueryParams;
  /** Satr o'zgarishsiz yuboriladi, qolgani `JSON.stringify` qilinadi */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignalLike;
  /** Shu so'rov uchun timeout (ms); 0 — cheklovsiz */
  timeout?: number;
}

export type RequestOptionsNoBody = Omit<RequestOptions, 'body'>;

export interface ApiClient {
  request<T = unknown>(method: string, path: string, options?: RequestOptions): Promise<T>;
  get<T = unknown>(path: string, options?: RequestOptionsNoBody): Promise<T>;
  delete<T = unknown>(path: string, options?: RequestOptionsNoBody): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: RequestOptionsNoBody): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: RequestOptionsNoBody): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: RequestOptionsNoBody): Promise<T>;
}

interface Controller {
  readonly signal: AbortSignalLike;
  abort(): void;
}

interface Globals {
  fetch?: FetchLike;
  AbortController?: new () => Controller;
  setTimeout?: (fn: () => void, ms: number) => unknown;
  clearTimeout?: (id: unknown) => void;
}

const g = globalThis as unknown as Globals;

/**
 * Asosiy manzil, yo'l va query'dan to'liq URL yasaydi. To'liq URL berilsa `baseUrl` ishlatilmaydi.
 * @example buildUrl('/api/', '/users', { page: 2, q: undefined }) // '/api/users?page=2'
 */
export function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  let url = /^[a-z][a-z\d+.-]*:\/\//i.test(path)
    ? path
    : `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  if (query) {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(query)) {
      const list: readonly QueryValue[] = Array.isArray(value) ? value : [value as QueryValue];
      for (const item of list) {
        if (item === undefined || item === null) continue;
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`);
      }
    }
    if (parts.length) url += (url.includes('?') ? '&' : '?') + parts.join('&');
  }
  return url;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}

function parseBody(text: string, res: FetchResponse): unknown {
  const type = res.headers.get('content-type') ?? '';
  return /json/i.test(type) ? JSON.parse(text) : text;
}

function serverMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null) {
    const m = (data as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return null;
}

/**
 * Yengil `fetch` o'rami: JSON, query, Bearer token, timeout va yagona `ApiError`.
 * 204/205 yoki bo'sh javob → `undefined`.
 * @example
 * const api = createApiClient({ baseUrl: '/api', getToken: () => store.get('token') });
 * const users = await api.get<User[]>('/users', { query: { page: 2, q: undefined } });
 */
export function createApiClient(options: ApiClientOptions): ApiClient {
  const defaultTimeout = options.timeout ?? 15000;

  async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
    const doFetch = options.fetch ?? g.fetch;
    if (!doFetch) throw new ApiError(API_MESSAGES.NETWORK, { code: 'NETWORK' });

    const outer = opts.signal as MinimalAbortSignal | undefined;
    if (outer?.aborted) throw new ApiError(API_MESSAGES.ABORTED, { code: 'ABORTED' });

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
      ...opts.headers,
    };
    const init: FetchInit = { method: method.toUpperCase(), headers };

    if (opts.body !== undefined) {
      if (typeof opts.body === 'string') {
        init.body = opts.body;
      } else {
        init.body = JSON.stringify(opts.body);
        if (!hasHeader(headers, 'content-type')) headers['Content-Type'] = 'application/json';
      }
    }

    const token = options.getToken ? await options.getToken() : null;
    if (token && !hasHeader(headers, 'authorization')) headers.Authorization = `Bearer ${token}`;
    // getToken kutilayotganda bekor qilingan bo'lishi mumkin
    if (outer?.aborted) throw new ApiError(API_MESSAGES.ABORTED, { code: 'ABORTED' });

    const controller = g.AbortController ? new g.AbortController() : null;
    if (controller) init.signal = controller.signal;
    else if (opts.signal) init.signal = opts.signal;
    const onAbort = () => controller?.abort();
    outer?.addEventListener('abort', onAbort, { once: true });

    let timedOut = false;
    const ms = opts.timeout ?? defaultTimeout;
    const timer =
      ms > 0 && controller && g.setTimeout
        ? g.setTimeout(() => {
            timedOut = true;
            controller.abort();
          }, ms)
        : undefined;

    const failure = (): ApiError => {
      if (timedOut) return new ApiError(API_MESSAGES.TIMEOUT, { code: 'TIMEOUT' });
      if (outer?.aborted) return new ApiError(API_MESSAGES.ABORTED, { code: 'ABORTED' });
      return new ApiError(API_MESSAGES.NETWORK, { code: 'NETWORK' });
    };

    try {
      let res: FetchResponse;
      let text: string;
      try {
        res = await doFetch(buildUrl(options.baseUrl, path, opts.query), init);
        text = res.status === 204 || res.status === 205 ? '' : await res.text();
      } catch {
        throw failure();
      }

      if (!res.ok) {
        let data: unknown = text || undefined;
        try {
          if (text) data = parseBody(text, res);
        } catch {
          // JSON buzuq — xom matn qoladi
        }
        throw new ApiError(serverMessage(data) ?? httpErrorMessage(res.status), {
          status: res.status,
          code: 'HTTP',
          data,
        });
      }

      if (!text) return undefined as T;
      try {
        return parseBody(text, res) as T;
      } catch {
        throw new ApiError(API_MESSAGES.PARSE, { status: res.status, code: 'PARSE', data: text });
      }
    } finally {
      if (timer !== undefined) g.clearTimeout?.(timer);
      outer?.removeEventListener('abort', onAbort);
    }
  }

  return {
    request,
    get: (path, o) => request('GET', path, o),
    delete: (path, o) => request('DELETE', path, o),
    post: (path, body, o) => request('POST', path, { ...o, body }),
    put: (path, body, o) => request('PUT', path, { ...o, body }),
    patch: (path, body, o) => request('PATCH', path, { ...o, body }),
  };
}
