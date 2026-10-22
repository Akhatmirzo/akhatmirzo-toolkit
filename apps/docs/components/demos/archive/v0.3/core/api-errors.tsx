'use client';

import { createApiClient, isApiError, type FetchLike } from '@akhatmirzo/core';
import { Badge, Button } from '@akhatmirzo/ui';
import { useState } from 'react';

// Haqiqiy server o'rniga: `/status/404` → 404 javob, `/sekin` → hech qachon javob bermaydi
const fakeFetch: FetchLike = (url, init) =>
  new Promise((resolve, reject) => {
    if (url.endsWith('/sekin')) {
      init.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      return;
    }
    const status = Number(url.split('/').pop());
    resolve({ ok: status < 400, status, headers: { get: () => null }, text: async () => '' });
  });

const api = createApiClient({ baseUrl: '/api', timeout: 1500, fetch: fakeFetch });

export default function CoreApiErrors() {
  const [result, setResult] = useState<{ code: string; message: string } | null>(null);

  const request = async (path: string) => {
    try {
      await api.get(path);
      setResult({ code: 'OK', message: 'Muvaffaqiyatli' });
    } catch (error) {
      if (isApiError(error)) setResult({ code: error.code, message: error.message });
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {['401', '403', '404', '422', '500'].map((s) => (
          <Button key={s} size="sm" variant="outline" onClick={() => request(`/status/${s}`)}>
            {s}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={() => request('/sekin')}>
          Timeout
        </Button>
      </div>
      {result && (
        <div className="flex items-center gap-2 text-sm">
          <Badge color={result.code === 'OK' ? 'success' : 'danger'}>{result.code}</Badge>
          <span className="text-text">{result.message}</span>
        </div>
      )}
    </div>
  );
}
