'use client';

import { toast } from '@akhatmirzo/ui';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useBank } from '../bank-store';
import { contacts, type Transaction } from '../data';
import { PageHeader } from '../ui';
import { TransferForm, type TransferDraft, type TransferQuote } from './transfer-form';
import { ConfirmStep, DEMO_OTP, OtpStep, Stepper, SuccessStep } from './transfer-steps';
import { recipientByCard, useRecipientLookup, type LookupState } from './use-recipient-lookup';

type Step = 'form' | 'confirm' | 'otp' | 'success';
const STEP_INDEX: Record<Step, number> = { form: 0, confirm: 1, otp: 2, success: 3 };

/**
 * O'tkazma oqimi: forma → tasdiqlash → SMS kod → chek. Balans haqiqatan kamayadi va
 * operatsiya tarixga qo'shiladi. `?to=c1` — saqlangan kontakt bilan oldindan to'ldirish.
 */
export function TransferView() {
  const { cards, addTransaction } = useBank();
  const params = useSearchParams();
  const preset = contacts.find((c) => c.id === params.get('to'));

  const firstActive = cards.find((c) => !c.blocked);
  const emptyDraft: TransferDraft = {
    method: 'card',
    cardNumber: '',
    phone: '',
    fromCardId: firstActive?.id ?? '',
    amount: null,
    comment: '',
  };
  const [draft, setDraft] = useState<TransferDraft>(() => ({
    ...emptyDraft,
    cardNumber: preset?.card ?? '',
  }));
  const initialLookup = (): LookupState => {
    if (!preset) return { status: 'idle' };
    const r = recipientByCard(preset.card, cards);
    return typeof r === 'string'
      ? { status: 'error', message: r }
      : { status: 'found', recipient: r };
  };
  const lookup = useRecipientLookup(initialLookup());
  const [step, setStep] = useState<Step>('form');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [tx, setTx] = useState<Transaction | null>(null);

  const go = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const complete = () => {
    if (!quote) return;
    const { recipient, from, amount, fee } = quote;
    const created = addTransaction({
      title: recipient.name,
      description:
        draft.method === 'card' ? "Kartadan kartaga o'tkazma" : "Telefon raqami orqali o'tkazma",
      amount: -amount,
      fee,
      category: 'transfers',
      kind: 'transfer',
      status: 'success',
      cardId: from.id,
      counterparty: recipient.masked,
      comment: draft.comment.trim() || undefined,
    });
    // O'z kartalari orasida — ikkinchi karta to'ldiriladi
    if (recipient.ownCardId) {
      addTransaction({
        title: from.name,
        description: "O'z kartalari orasida o'tkazma",
        amount,
        fee: 0,
        category: 'income',
        kind: 'transfer',
        status: 'success',
        cardId: recipient.ownCardId,
        counterparty: recipient.masked,
      });
    }
    setTx(created);
    go('success');
    toast.success("O'tkazma bajarildi", { description: `ID: ${created.id}` });
  };

  const startNew = () => {
    setDraft(emptyDraft);
    lookup.reset();
    setQuote(null);
    setTx(null);
    go('form');
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="O'tkazma"
        description="Karta yoki telefon raqami bo'yicha — bir zumda, 24/7"
      />
      <Stepper current={STEP_INDEX[step]} />

      {step === 'form' && (
        <TransferForm
          draft={draft}
          onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
          lookup={lookup}
          onSubmit={(q) => {
            setQuote(q);
            go('confirm');
          }}
        />
      )}
      {step === 'confirm' && quote && (
        <ConfirmStep
          quote={quote}
          comment={draft.comment.trim()}
          onBack={() => go('form')}
          onConfirm={() => {
            toast.info('SMS kod yuborildi', { description: `Demo kod: ${DEMO_OTP}` });
            go('otp');
          }}
        />
      )}
      {step === 'otp' && <OtpStep onBack={() => go('confirm')} onVerified={complete} />}
      {step === 'success' && tx && quote && <SuccessStep tx={tx} quote={quote} onNew={startNew} />}
    </div>
  );
}
