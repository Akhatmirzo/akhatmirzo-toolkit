import type { ComboboxOption } from '@akhatmirzo/ui';

/**
 * Namuna uchun statik ma'lumotlar. Backend yo'q: hisoblar brauzerning localStorage'ida
 * saqlanadi (faqat demo — haqiqiy ilovada parol hech qachon mijozda saqlanmaydi).
 */

export const DEMO_PASSWORD = 'Parol123!';
export const DEMO_CODE = '123456';
/** Ketma-ket noto'g'ri urinishlar chegarasi va bloklash muddati */
export const MAX_ATTEMPTS = 3;
export const LOCK_SECONDS = 30;
export const RESEND_SECONDS = 30;

export interface Account {
  /** 9 raqam, +998 siz */
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  region?: string;
  createdAt: string;
}

export const demoAccount: Account = {
  phone: '901234567',
  email: 'aziza@misol.uz',
  firstName: 'Aziza',
  lastName: 'Karimova',
  password: DEMO_PASSWORD,
  region: 'toshkent-sh',
  createdAt: '2025-03-14T09:00:00.000Z',
};

export const storageKeys = {
  accounts: 'auth-demo:accounts',
  lock: 'auth-demo:lock',
  pending: 'auth-demo:pending',
  signUp: 'auth-demo:sign-up',
  forgot: 'auth-demo:forgot',
  remembered: 'auth-demo:remembered',
} as const;

export const regions: ComboboxOption[] = [
  { value: 'toshkent-sh', label: 'Toshkent shahri' },
  { value: 'toshkent', label: 'Toshkent viloyati' },
  { value: 'andijon', label: 'Andijon viloyati' },
  { value: 'buxoro', label: 'Buxoro viloyati' },
  { value: 'fargona', label: "Farg'ona viloyati" },
  { value: 'jizzax', label: 'Jizzax viloyati' },
  { value: 'xorazm', label: 'Xorazm viloyati' },
  { value: 'namangan', label: 'Namangan viloyati' },
  { value: 'navoiy', label: 'Navoiy viloyati' },
  { value: 'qashqadaryo', label: 'Qashqadaryo viloyati' },
  { value: 'qoraqalpogiston', label: "Qoraqalpog'iston Respublikasi" },
  { value: 'samarqand', label: 'Samarqand viloyati' },
  { value: 'sirdaryo', label: 'Sirdaryo viloyati' },
  { value: 'surxondaryo', label: 'Surxondaryo viloyati' },
];

export const testimonials = [
  {
    quote:
      "Ro'yxatdan o'tish bir daqiqa ham olmadi: raqamni kiritdim, SMS keldi — tamom. Endi barcha to'lovlarim bir joyda.",
    name: 'Jasur Toshmatov',
    role: 'Tadbirkor, Samarqand',
  },
  {
    quote:
      'Ilovaning qulayligi va xavfsizligi meni hayratda qoldirdi. Har bir kirish SMS bilan tasdiqlanadi — xotirjamman.',
    name: 'Malika Yusupova',
    role: 'Dizayner, Toshkent',
  },
  {
    quote:
      "Parolimni unutgan edim — ikki daqiqada tikladim. Qo'llab-quvvatlash xizmatiga yozish ham shart bo'lmadi.",
    name: 'Otabek Rahimov',
    role: "O'qituvchi, Farg'ona",
  },
];

/** Soxta tarmoq kechikishi — loading holatlarini ko'rsatish uchun */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** "+998 90 *** ** 67" — raqamning o'rtasini yashiradi */
export function maskPhone(phone: string) {
  const d = phone.replace(/\D/g, '').slice(-9);
  return `+998 ${d.slice(0, 2)} *** ** ${d.slice(7, 9)}`;
}
