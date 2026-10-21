import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  API_MESSAGES,
  ApiError,
  buildUrl,
  createApiClient,
  httpErrorMessage,
  isApiError,
  type AbortSignalLike,
  type FetchInit,
  type FetchResponse,
} from './index';
import type { MinimalAbortSignal } from './types';

// core tsconfig DOM tiplarisiz — runtime'dagi (Node) AbortController
const AbortCtrl = (
  globalThis as unknown as { AbortController: new () => { signal: AbortSignalLike; abort(): void } }
).AbortController;

function reply(
  status: number,
  body?: unknown,
  contentType = typeof body === 'string' ? 'text/plain' : 'application/json',
): FetchResponse {
  const text = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (n) => (n.toLowerCase() === 'content-type' ? contentType : null) },
    text: () => Promise.resolve(text),
  };
}

function setup(response: FetchResponse | (() => Promise<FetchResponse>) = reply(200, {})) {
  const fetch = vi.fn((_url: string, _init: FetchInit) =>
    typeof response === 'function' ? response() : Promise.resolve(response),
  );
  return { fetch, call: () => fetch.mock.calls[0] as [string, FetchInit] };
}

async function catchError(p: Promise<unknown>): Promise<ApiError> {
  try {
    await p;
  } catch (e) {
    if (e instanceof ApiError) return e;
    throw e;
  }
  throw new Error('xato kutilgandi');
}

/** fetch ni signal bekor qilinguncha osiltirib turadi */
function hanging(): (url: string, init: FetchInit) => Promise<FetchResponse> {
  return (_url, init) =>
    new Promise((_resolve, reject) => {
      const signal = init.signal as MinimalAbortSignal;
      signal.addEventListener('abort', () => reject(new Error('AbortError')));
    });
}

afterEach(() => {
  vi.useRealTimers();
});

describe('buildUrl', () => {
  it('slashlarni birlashtiradi', () => {
    expect(buildUrl('https://api.uz/v1/', '/users')).toBe('https://api.uz/v1/users');
    expect(buildUrl('https://api.uz/v1', 'users')).toBe('https://api.uz/v1/users');
    expect(buildUrl('', '/users')).toBe('/users');
  });

  it("to'liq URL da baseUrl ishlatilmaydi", () => {
    expect(buildUrl('https://api.uz', 'https://cdn.uz/x')).toBe('https://cdn.uz/x');
  });

  it('query: undefined/null tashlanadi, massiv takrorlanadi, kodlanadi', () => {
    expect(
      buildUrl('/api', '/s', {
        q: 'Oʻzbekiston & Тошкент',
        page: 2,
        active: false,
        empty: '',
        skip: undefined,
        nil: null,
        tag: ['a', undefined, 'b'],
      }),
    ).toBe(
      `/api/s?q=${encodeURIComponent('Oʻzbekiston & Тошкент')}&page=2&active=false&empty=&tag=a&tag=b`,
    );
  });

  it("mavjud ? ga & bilan qo'shadi; bo'sh query o'zgartirmaydi", () => {
    expect(buildUrl('/api', '/s?x=1', { y: 2 })).toBe('/api/s?x=1&y=2');
    expect(buildUrl('/api', '/s', { y: undefined })).toBe('/api/s');
  });
});

describe('createApiClient', () => {
  it('GET: JSON javob, standart sarlavhalar', async () => {
    const { fetch, call } = setup(reply(200, [{ id: 1 }]));
    const api = createApiClient({ baseUrl: '/api', fetch, headers: { 'X-App': 'demo' } });
    const data = await api.get<{ id: number }[]>('/users', { query: { page: 1, q: undefined } });
    expect(data).toEqual([{ id: 1 }]);
    const [url, init] = call();
    expect(url).toBe('/api/users?page=1');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.headers).toEqual({ Accept: 'application/json', 'X-App': 'demo' });
    expect(init.signal).toBeDefined();
  });

  it('POST/PUT/PATCH: JSON body va Content-Type', async () => {
    const { fetch } = setup(reply(201, { ok: true }));
    const api = createApiClient({ baseUrl: '/api', fetch });
    await api.post('/a', { ism: 'Sarvar' });
    await api.put('/a', [1, 2]);
    await api.patch('/a', 'xom matn', { headers: { 'Content-Type': 'text/plain' } });
    const calls = fetch.mock.calls;
    expect(calls[0]?.[1]).toMatchObject({
      method: 'POST',
      body: '{"ism":"Sarvar"}',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(calls[1]?.[1]).toMatchObject({ method: 'PUT', body: '[1,2]' });
    expect(calls[2]?.[1].body).toBe('xom matn');
    expect(calls[2]?.[1].headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'text/plain',
    });
  });

  it('DELETE va request: 204 → undefined', async () => {
    const { fetch } = setup(reply(204));
    const api = createApiClient({ baseUrl: '/api', fetch });
    await expect(api.delete('/a/1')).resolves.toBeUndefined();
    await expect(api.request('options', '/a')).resolves.toBeUndefined();
    expect(fetch.mock.calls[1]?.[1].method).toBe('OPTIONS');
  });

  it("bo'sh 200 → undefined, matnli javob → satr", async () => {
    const api1 = createApiClient({ baseUrl: '', fetch: setup(reply(200)).fetch });
    await expect(api1.get('/x')).resolves.toBeUndefined();
    const api2 = createApiClient({ baseUrl: '', fetch: setup(reply(200, 'salom')).fetch });
    await expect(api2.get('/x')).resolves.toBe('salom');
  });

  it('Bearer token (sinxron va asinxron), token yo‘q bo‘lsa sarlavha yo‘q', async () => {
    const { fetch } = setup();
    let token: string | null = 'abc';
    const api = createApiClient({ baseUrl: '', fetch, getToken: () => token });
    await api.get('/x');
    token = null;
    await api.get('/x');
    expect(fetch.mock.calls[0]?.[1].headers.Authorization).toBe('Bearer abc');
    expect(fetch.mock.calls[1]?.[1].headers).not.toHaveProperty('Authorization');

    const api2 = createApiClient({ baseUrl: '', fetch, getToken: async () => 'xyz' });
    await api2.get('/x');
    expect(fetch.mock.calls[2]?.[1].headers.Authorization).toBe('Bearer xyz');
  });

  it('HTTP xato: server xabari va data', async () => {
    const body = { message: 'Telefon band', field: 'phone' };
    const api = createApiClient({ baseUrl: '', fetch: setup(reply(422, body)).fetch });
    const err = await catchError(api.post('/x', {}));
    expect(err).toBeInstanceOf(Error);
    expect(isApiError(err)).toBe(true);
    expect(err).toMatchObject({ name: 'ApiError', status: 422, code: 'HTTP', data: body });
    expect(err.message).toBe('Telefon band');
  });

  it('HTTP xato: server xabari bo‘lmasa standart o‘zbekcha matn', async () => {
    const api = createApiClient({ baseUrl: '', fetch: setup(reply(404, { error: 1 })).fetch });
    const err = await catchError(api.get('/x'));
    expect(err.message).toBe('Topilmadi.');
    const api500 = createApiClient({ baseUrl: '', fetch: setup(reply(503, '<html>')).fetch });
    const err500 = await catchError(api500.get('/x'));
    expect(err500).toMatchObject({ status: 503, code: 'HTTP', data: '<html>' });
    expect(err500.message).toBe(httpErrorMessage(503));
  });

  it('HTTP xato: buzuq JSON — data xom matn', async () => {
    const api = createApiClient({
      baseUrl: '',
      fetch: setup(reply(400, '{buzuq', 'application/json')).fetch,
    });
    const err = await catchError(api.get('/x'));
    expect(err).toMatchObject({ status: 400, code: 'HTTP', data: '{buzuq' });
  });

  it('PARSE: muvaffaqiyatli javobda buzuq JSON', async () => {
    const api = createApiClient({
      baseUrl: '',
      fetch: setup(reply(200, 'not json', 'application/json; charset=utf-8')).fetch,
    });
    const err = await catchError(api.get('/x'));
    expect(err).toMatchObject({ code: 'PARSE', status: 200, message: API_MESSAGES.PARSE });
  });

  it('NETWORK: fetch rad etilsa', async () => {
    const fetch = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));
    const api = createApiClient({ baseUrl: '', fetch });
    const err = await catchError(api.get('/x'));
    expect(err).toMatchObject({ code: 'NETWORK', status: 0 });
    expect(err.message).toBe("Ulanib bo'lmadi. Internetni tekshiring.");
  });

  it('TIMEOUT: standart 15000 ms', async () => {
    vi.useFakeTimers();
    const api = createApiClient({ baseUrl: '', fetch: hanging() });
    const p = catchError(api.get('/x'));
    await vi.advanceTimersByTimeAsync(14999);
    await vi.advanceTimersByTimeAsync(1);
    const err = await p;
    expect(err).toMatchObject({ code: 'TIMEOUT', message: "So'rov vaqti tugadi." });
  });

  it("TIMEOUT: so'rov darajasida o'zgartirish; 0 — cheklovsiz", async () => {
    vi.useFakeTimers();
    const api = createApiClient({ baseUrl: '', fetch: hanging(), timeout: 1000 });
    const p = catchError(api.get('/x', { timeout: 50 }));
    await vi.advanceTimersByTimeAsync(50);
    expect((await p).code).toBe('TIMEOUT');

    let settled = false;
    const unlimited = createApiClient({ baseUrl: '', fetch: hanging(), timeout: 0 });
    void unlimited.get('/x').finally(() => (settled = true));
    await vi.advanceTimersByTimeAsync(10 ** 7);
    expect(settled).toBe(false);
  });

  it("muvaffaqiyatdan so'ng timer tozalanadi", async () => {
    vi.useFakeTimers();
    const api = createApiClient({ baseUrl: '', fetch: setup().fetch });
    await api.get('/x');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ABORTED: tashqi signal', async () => {
    const ctrl = new AbortCtrl();
    const api = createApiClient({ baseUrl: '', fetch: hanging() });
    const p = catchError(api.get('/x', { signal: ctrl.signal }));
    ctrl.abort();
    expect(await p).toMatchObject({ code: 'ABORTED', message: API_MESSAGES.ABORTED });
  });

  it('ABORTED: oldindan bekor qilingan signal — fetch chaqirilmaydi', async () => {
    const { fetch } = setup();
    const ctrl = new AbortCtrl();
    ctrl.abort();
    const api = createApiClient({ baseUrl: '', fetch });
    expect((await catchError(api.get('/x', { signal: ctrl.signal }))).code).toBe('ABORTED');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('ABORTED: getToken kutilayotganda bekor qilinsa fetch chaqirilmaydi', async () => {
    const { fetch } = setup();
    const ctrl = new AbortCtrl();
    let release: (t: string) => void = () => {};
    const getToken = () => new Promise<string>((r) => (release = r));
    const api = createApiClient({ baseUrl: '', fetch, getToken });
    const p = catchError(api.get('/x', { signal: ctrl.signal }));
    await Promise.resolve();
    ctrl.abort();
    release('tok');
    expect(await p).toMatchObject({ code: 'ABORTED', message: API_MESSAGES.ABORTED });
    expect(fetch).not.toHaveBeenCalled();
  });
});
