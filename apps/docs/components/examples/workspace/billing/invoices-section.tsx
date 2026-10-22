'use client';

import { formatDate, formatMoney } from '@akhatmirzo/core';
import {
  Badge,
  Button,
  DataTable,
  IconButton,
  Tooltip,
  toast,
  type DataTableColumn,
} from '@akhatmirzo/ui';
import { Download, FileText } from 'lucide-react';
import { useMemo } from 'react';
import { company, invoices, invoiceStatus, type Invoice } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { downloadText, fromIsoDate } from '../utils';

/** Hisob-faktura matni (namunada PDF o'rniga oddiy matnli fayl) */
function invoiceText(inv: Invoice) {
  return [
    `${company.name} — HISOB-FAKTURA ${inv.id}`,
    '',
    `Sana:    ${formatDate(fromIsoDate(inv.date), 'd MMMM yyyy')}`,
    `Xizmat:  ${inv.description}`,
    `Summa:   ${formatMoney(inv.amount)}`,
    `Holat:   ${invoiceStatus[inv.status].label}`,
    '',
    'Rahmat!',
  ].join('\n');
}

export function InvoicesSection() {
  const { billing, setBilling } = useWorkspace();

  // Namunada "To'lash" bosilgan fakturalar to'langan bo'ladi
  const rows = useMemo(
    () =>
      invoices.map((inv) =>
        billing.paid.includes(inv.id) ? { ...inv, status: 'paid' as const } : inv,
      ),
    [billing.paid],
  );

  const download = (inv: Invoice) =>
    toast
      .promise(fakeRequest(800), {
        loading: `${inv.id} tayyorlanmoqda...`,
        success: `${inv.id} yuklab olindi`,
        error: "Yuklab bo'lmadi",
      })
      .then(() => downloadText(`${inv.id}.txt`, invoiceText(inv)));

  const pay = (inv: Invoice) =>
    toast
      .promise(fakeRequest(1200), {
        loading: `${formatMoney(inv.amount)} to'lanmoqda...`,
        success: `${inv.id} to'landi`,
        error: "To'lov o'tmadi",
      })
      .then(() => setBilling((prev) => ({ ...prev, paid: [...prev.paid, inv.id] })));

  const columns: DataTableColumn<Invoice>[] = [
    {
      key: 'id',
      header: 'Raqam',
      sortable: true,
      hideable: false,
      cell: (inv) => (
        <span className="flex items-center gap-2 font-medium">
          <FileText aria-hidden="true" className="size-4 text-text-faint" />
          {inv.id}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Sana',
      sortable: true,
      accessor: (inv) => fromIsoDate(inv.date),
      cell: (inv) => formatDate(fromIsoDate(inv.date), 'd MMM yyyy'),
    },
    { key: 'description', header: 'Tavsif', hidden: false },
    {
      key: 'amount',
      header: 'Summa',
      numeric: true,
      sortable: true,
      cell: (inv) => formatMoney(inv.amount),
    },
    {
      key: 'status',
      header: 'Holat',
      searchValue: (inv) => invoiceStatus[inv.status].label,
      cell: (inv) => (
        <Badge color={invoiceStatus[inv.status].color} dot>
          {invoiceStatus[inv.status].label}
        </Badge>
      ),
    },
  ];

  return (
    <section aria-labelledby="invoices-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="invoices-title" className="text-base font-semibold">
            Hisob-fakturalar
          </h2>
          <p className="mt-1 text-sm text-text-muted">Har oy boshida avtomatik yaratiladi.</p>
        </div>
      </div>
      <DataTable
        label="Hisob-fakturalar"
        data={rows}
        columns={columns}
        columnToggle={false}
        pagination={{ pageSize: 6, pageSizeOptions: [6, 12] }}
        initialState={{ sorting: [{ id: 'date', desc: true }] }}
        mobileView="cards"
        rowActions={(inv) => (
          <div className="flex items-center justify-end gap-1">
            {inv.status === 'pending' && (
              <Button size="sm" variant="primary" onClick={() => pay(inv)}>
                To&apos;lash
              </Button>
            )}
            <Tooltip content="Yuklab olish">
              <IconButton
                size="sm"
                variant="ghost"
                aria-label={`${inv.id} ni yuklab olish`}
                onClick={() => download(inv)}
              >
                <Download aria-hidden="true" />
              </IconButton>
            </Tooltip>
          </div>
        )}
      />
    </section>
  );
}
