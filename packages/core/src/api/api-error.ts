export type ApiErrorCode = 'HTTP' | 'NETWORK' | 'TIMEOUT' | 'ABORTED' | 'PARSE';

/** API so'rovlaridagi yagona xato turi. HTTP bo'lmagan xatolarda `status` = 0. */
export class ApiError extends Error {
  override name = 'ApiError';
  readonly status: number;
  readonly code: ApiErrorCode;
  /** Server javobi (JSON yoki matn), bo'lsa */
  readonly data?: unknown;

  constructor(message: string, init: { status?: number; code: ApiErrorCode; data?: unknown }) {
    super(message);
    this.status = init.status ?? 0;
    this.code = init.code;
    if (init.data !== undefined) this.data = init.data;
  }
}

/** Qiymat `ApiError` ekanini tekshiradi. */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** HTTP bo'lmagan xatolar matnlari. */
export const API_MESSAGES = {
  NETWORK: "Ulanib bo'lmadi. Internetni tekshiring.",
  TIMEOUT: "So'rov vaqti tugadi.",
  ABORTED: "So'rov bekor qilindi.",
  PARSE: "Server javobini o'qib bo'lmadi.",
} as const;

/**
 * HTTP status uchun o'zbekcha standart xabar.
 * @example httpErrorMessage(404) // 'Topilmadi.'
 */
export function httpErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return "So'rov noto'g'ri.";
    case 401:
      return "Avtorizatsiyadan o'tilmagan. Qaytadan kiring.";
    case 403:
      return "Bu amal uchun ruxsat yo'q.";
    case 404:
      return 'Topilmadi.';
    case 409:
      return "Ziddiyat: ma'lumot allaqachon o'zgargan.";
    case 422:
      return "Ma'lumotlar noto'g'ri to'ldirilgan.";
    case 429:
      return "Juda ko'p so'rov. Birozdan so'ng urinib ko'ring.";
    default:
      return status >= 500
        ? "Serverda xatolik. Keyinroq urinib ko'ring."
        : `So'rov bajarilmadi (${status}).`;
  }
}
