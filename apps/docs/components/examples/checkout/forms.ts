import { isValidCardNumber, isValidPhone } from '@akhatmirzo/core';
import { regionById, timeSlots, type DeliveryMethod, type PaymentMethod } from './data';

/* ---------- Sana yordamchilari (mahalliy vaqt, "yyyy-MM-dd") ---------- */

export function toIsoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromIsoDate(s: string | null): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

/** Yetkazib berish oynasi: bugundan 14 kungacha, yakshanba — dam olish */
export const MAX_DELIVERY_DAYS = 14;
export const isSunday = (d: Date) => d.getDay() === 0;

/** Bugungi kun uchun o'tib ketgan vaqt oraliqlari tanlanmaydi (boshlanishiga kamida 1 soat qolishi kerak) */
export function isSlotAvailable(slotId: string, date: Date | null, now: Date) {
  const slot = timeSlots.find((s) => s.id === slotId);
  if (!slot || !date) return Boolean(slot);
  if (toIsoDate(date) !== toIsoDate(now)) return true;
  return now.getHours() + 1 < slot.startHour;
}

/* ---------- Yetkazib berish formasi ---------- */

export interface DeliveryForm {
  name: string;
  phone: string;
  method: DeliveryMethod;
  region: string;
  district: string | null;
  address: string;
  note: string;
  pickupPoint: string;
  date: string | null;
  slot: string;
}

export const initialDelivery: DeliveryForm = {
  name: '',
  phone: '',
  method: 'courier',
  region: '',
  district: null,
  address: '',
  note: '',
  pickupPoint: '',
  date: null,
  slot: '',
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export function validateDelivery(form: DeliveryForm, now: Date): FormErrors<DeliveryForm> {
  const e: FormErrors<DeliveryForm> = {};
  const name = form.name.trim();
  if (!name) e.name = 'Ism va familiyani kiriting';
  else if (name.length < 3) e.name = 'Ism juda qisqa';

  if (!form.phone) e.phone = 'Telefon raqamini kiriting';
  else if (!isValidPhone(form.phone)) e.phone = "Raqam to'liq emas yoki operator kodi noto'g'ri";

  if (form.method === 'pickup') {
    if (!form.pickupPoint) e.pickupPoint = 'Topshirish punktini tanlang';
  } else {
    if (!form.region) e.region = 'Viloyatni tanlang';
    const region = regionById.get(form.region);
    if (!form.district || !region?.districts.includes(form.district))
      e.district = 'Shahar yoki tumanni tanlang';
    if (form.address.trim().length < 5) e.address = "Ko'cha, uy va xonadon raqamini yozing";
  }

  if (form.method !== 'post') {
    const date = fromIsoDate(form.date);
    const today = startOfDay(now);
    if (!date) e.date = 'Sanani tanlang';
    else if (date < today || date > addDays(today, MAX_DELIVERY_DAYS) || isSunday(date))
      e.date = "Bu sanada yetkazib bo'lmaydi — boshqa kunni tanlang";
    if (form.method === 'courier') {
      if (!form.slot) e.slot = "Qulay vaqt oralig'ini tanlang";
      else if (!isSlotAvailable(form.slot, date, now)) e.slot = "Bu vaqt oralig'i o'tib ketgan";
    }
  }
  return e;
}

/* ---------- To'lov formasi ---------- */

export interface PaymentForm {
  method: PaymentMethod;
  /** Saqlangan kartadan to'lash */
  useSaved: boolean;
  cardNumber: string;
  /** "MMYY" — 4 raqam */
  expiry: string;
  holder: string;
  saveCard: boolean;
  walletPhone: string;
  agree: boolean;
}

export const initialPayment: PaymentForm = {
  method: 'card',
  useSaved: true,
  cardNumber: '',
  expiry: '',
  holder: '',
  saveCard: false,
  walletPhone: '',
  agree: false,
};

export function validatePayment(
  form: PaymentForm,
  ctx: { now: Date; delivery: DeliveryMethod; hasSavedCard: boolean },
): FormErrors<PaymentForm> {
  const e: FormErrors<PaymentForm> = {};
  if (form.method === 'cash' && ctx.delivery === 'post')
    e.method = "Pochta orqali yuborishda naqd to'lov mavjud emas";

  if (form.method === 'card' && !(form.useSaved && ctx.hasSavedCard)) {
    if (form.cardNumber.length < 16) e.cardNumber = "Karta raqamini to'liq kiriting";
    else if (!isValidCardNumber(form.cardNumber)) e.cardNumber = "Karta raqami noto'g'ri";

    const month = Number(form.expiry.slice(0, 2));
    const year = 2000 + Number(form.expiry.slice(2, 4));
    const nowMonth = ctx.now.getFullYear() * 12 + ctx.now.getMonth();
    const cardMonth = year * 12 + month - 1;
    if (form.expiry.length < 4) e.expiry = 'Muddatni OO/YY shaklida kiriting';
    else if (month < 1 || month > 12) e.expiry = "Oy 01 dan 12 gacha bo'lishi kerak";
    else if (cardMonth < nowMonth) e.expiry = 'Karta muddati tugagan';
    else if (cardMonth > nowMonth + 12 * 10) e.expiry = "Muddat noto'g'ri";

    if (!/^[A-Za-z' -]{3,}$/.test(form.holder.trim()))
      e.holder = 'Kartadagi kabi lotin harflarida yozing';
  }

  if ((form.method === 'click' || form.method === 'payme') && !isValidPhone(form.walletPhone))
    e.walletPhone = 'Hamyonga ulangan raqamni kiriting';

  if (!form.agree) e.agree = 'Davom etish uchun shartlarga rozilik bering';
  return e;
}

export const hasErrors = (e: object) => Object.keys(e).length > 0;
