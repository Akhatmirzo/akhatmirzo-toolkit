import { formatMoney } from '@akhatmirzo/core';
import { toast } from '@akhatmirzo/ui';
import { maskCard, type BankCard, type Transaction } from './data';
import { formatDateTime, statusLabels } from './ui';

/** Chek matni (ulashish va yuklab olish uchun) */
export function receiptText(tx: Transaction, card?: BankCard) {
  const lines = [
    'Mirzo Bank — elektron chek',
    '',
    `Operatsiya: ${tx.title}`,
    `Turi: ${tx.description}`,
    `Summa: ${formatMoney(Math.abs(tx.amount))}`,
    `Komissiya: ${formatMoney(tx.fee)}`,
    `Sana: ${formatDateTime(tx.date)}`,
    `Holat: ${statusLabels[tx.status]}`,
    card ? `Karta: ${maskCard(card.number)}` : '',
    tx.counterparty ? `Qabul qiluvchi: ${tx.counterparty}` : '',
    tx.comment ? `Izoh: ${tx.comment}` : '',
    `Tranzaksiya ID: ${tx.id}`,
  ];
  return lines.filter((l, i) => l !== '' || i === 1).join('\n');
}

/** Chekni .txt fayl sifatida yuklab beradi */
export function downloadReceipt(tx: Transaction, card?: BankCard) {
  const blob = new Blob([receiptText(tx, card)], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chek-${tx.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('Chek yuklab olindi', { description: `chek-${tx.id}.txt` });
}

/** Tizimning "Ulashish" oynasi; bo'lmasa — matn buferga nusxalanadi */
export async function shareReceipt(tx: Transaction, card?: BankCard) {
  const text = receiptText(tx, card);
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ title: 'Mirzo Bank cheki', text });
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success('Chek nusxalandi', { description: 'Matnni xohlagan joyga joylang.' });
  } catch (error) {
    // Foydalanuvchi ulashish oynasini yopdi — xato emas
    if (error instanceof DOMException && error.name === 'AbortError') return;
    toast.error("Chekni ulashib bo'lmadi");
  }
}
