'use client';

import { formatCardNumber } from '@akhatmirzo/core';
import { useCopyToClipboard } from '@akhatmirzo/hooks';
import { Badge, Button, Card, confirm, Switch, toast } from '@akhatmirzo/ui';
import { Check, Copy, CreditCard, Plus, Trash2 } from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BankCardVisual } from '../bank-card';
import { useBank } from '../bank-store';
import { brandLabels, type BankCard } from '../data';
import { EmptyState, Money, PageHeader } from '../ui';
import { AddCardDialog } from './add-card-dialog';

function CardManager({ card }: { card: BankCard }) {
  const { updateCard, removeCard, cards, hideBalance } = useBank();
  const { copied, copy } = useCopyToClipboard();

  const toggleBlock = async (blocked: boolean) => {
    const ok = await confirm(
      blocked
        ? {
            title: 'Kartani bloklaysizmi?',
            description:
              "Bloklangan karta bilan to'lov va o'tkazmalar vaqtincha to'xtatiladi. Istalgan payt blokdan chiqarishingiz mumkin.",
            confirmText: 'Bloklash',
            variant: 'danger',
          }
        : {
            title: 'Kartani blokdan chiqarasizmi?',
            description: "Karta bilan yana to'lov va o'tkazmalar qilish mumkin bo'ladi.",
            confirmText: 'Blokdan chiqarish',
          },
    );
    if (!ok) return;
    updateCard(card.id, { blocked });
    if (blocked) toast.warning('Karta bloklandi', { description: card.name });
    else toast.success('Karta blokdan chiqarildi', { description: card.name });
  };

  const handleRemove = async () => {
    if (cards.length <= 1) {
      toast.error("Oxirgi kartani o'chirib bo'lmaydi");
      return;
    }
    const ok = await confirm({
      title: "Kartani o'chirasizmi?",
      description: `"${card.name}" ilovadan uziladi. Operatsiyalar tarixi saqlanib qoladi.`,
      confirmText: "O'chirish",
      variant: 'danger',
    });
    if (!ok) return;
    removeCard(card.id);
    toast.success("Karta o'chirildi");
  };

  return (
    <Card padding="sm" className="gap-4">
      <BankCardVisual card={card} hideBalance={hideBalance} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-text">{card.name}</h2>
          <p className="text-xs text-text-muted">
            {brandLabels[card.brand]} · muddati {card.expiry}
          </p>
        </div>
        {card.blocked ? (
          <Badge color="danger" dot>
            Bloklangan
          </Badge>
        ) : (
          <Badge color="success" dot>
            Faol
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2.5 text-sm">
        <span className="text-text-muted">Balans</span>
        <Money value={card.balance} hidden={hideBalance} className="font-semibold text-text" />
      </div>
      <Switch
        checked={card.blocked}
        onCheckedChange={toggleBlock}
        label="Kartani bloklash"
        description="Yo'qolsa yoki shubhali operatsiya bo'lsa"
      />
      <div className="grid grid-cols-2 gap-2">
        <Button
          size="sm"
          leftIcon={copied ? <Check /> : <Copy />}
          onClick={async () => {
            await copy(card.number);
            toast.success('Karta raqami nusxalandi', {
              description: formatCardNumber(card.number),
            });
          }}
        >
          {copied ? 'Nusxalandi' : 'Raqamni nusxalash'}
        </Button>
        <Button size="sm" variant="ghost" leftIcon={<Trash2 />} onClick={handleRemove}>
          O&apos;chirish
        </Button>
      </div>
    </Card>
  );
}

export function CardsView() {
  const { cards } = useBank();
  const params = useSearchParams();
  const pathname = usePathname();
  // "?add=1" — bosh sahifadagi "Karta qo'shish" havolasi oynani darhol ochadi
  const [addOpen, setAddOpenState] = useState(params.get('add') === '1');
  const setAddOpen = (open: boolean) => {
    setAddOpenState(open);
    if (!open && params.get('add')) window.history.replaceState(null, '', pathname);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Kartalar"
        description="Kartalarni qo'shing, bloklang va boshqaring"
        actions={
          <Button variant="primary" leftIcon={<Plus />} onClick={() => setAddOpen(true)}>
            Karta qo&apos;shish
          </Button>
        }
      />
      {cards.length === 0 ? (
        <Card variant="outline" padding="none">
          <EmptyState
            icon={CreditCard}
            title="Kartalar yo'q"
            description="Birinchi kartangizni qo'shing."
            action={
              <Button variant="primary" onClick={() => setAddOpen(true)}>
                Karta qo&apos;shish
              </Button>
            }
          />
        </Card>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <li key={c.id}>
              <CardManager card={c} />
            </li>
          ))}
        </ul>
      )}
      <AddCardDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
