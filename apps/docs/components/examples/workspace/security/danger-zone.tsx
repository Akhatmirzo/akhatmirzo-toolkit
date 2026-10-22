'use client';

import { Button, Dialog, Field, Input, toast } from '@akhatmirzo/ui';
import { Download, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { company } from '../data';
import { fakeRequest, useWorkspace } from '../store';
import { SettingsSection } from '../ui';
import { downloadText } from '../utils';

export function DangerZone() {
  const { employees, profile, resetAll } = useWorkspace();
  const [open, setOpen] = useState(false);

  const exportData = () => {
    downloadText(
      'bulut-tech-eksport.json',
      JSON.stringify({ profile, employees }, null, 2),
      'application/json',
    );
    toast.success("Ma'lumotlar yuklab olindi", { description: 'bulut-tech-eksport.json' });
  };

  return (
    <SettingsSection
      title="Xavfli zona"
      tone="danger"
      description="Bu amallarni ortga qaytarib bo'lmaydi."
    >
      <div className="flex flex-col divide-y divide-border">
        <div className="flex flex-wrap items-center gap-3 pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Ma&apos;lumotlarni eksport qilish</p>
            <p className="text-sm text-text-muted">Profil va xodimlar ro&apos;yxati — JSON fayl.</p>
          </div>
          <Button variant="outline" leftIcon={<Download aria-hidden="true" />} onClick={exportData}>
            Eksport
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Hisobni o&apos;chirish</p>
            <p className="text-sm text-text-muted">
              {company.name} ish maydoni, {employees.length} ta xodim va barcha fayllar butunlay
              o&apos;chiriladi.
            </p>
          </div>
          <Button
            variant="danger"
            leftIcon={<Trash2 aria-hidden="true" />}
            onClick={() => setOpen(true)}
          >
            Hisobni o&apos;chirish
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        {open && (
          <Dialog.Content
            role="alertdialog"
            size="sm"
            title="Hisobni o'chirasizmi?"
            description="Bu amalni ortga qaytarib bo'lmaydi. Barcha xodimlar kirish huquqini yo'qotadi, fayllar va hisob-fakturalar o'chiriladi."
          >
            <DeleteConfirm
              onCancel={() => setOpen(false)}
              onDeleted={() => {
                setOpen(false);
                resetAll();
                toast.success("Hisob o'chirildi", {
                  description: "Bu namuna — ma'lumotlar boshlang'ich holatga qaytarildi.",
                });
              }}
            />
          </Dialog.Content>
        )}
      </Dialog>
    </SettingsSection>
  );
}

/** Nomini yozib tasdiqlash: matn aynan mos kelmaguncha tugma o'chiq */
function DeleteConfirm({ onCancel, onDeleted }: { onCancel: () => void; onDeleted: () => void }) {
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const matches = text.trim() === company.name;

  const submit = async () => {
    if (!matches) return;
    setDeleting(true);
    await fakeRequest(1200);
    onDeleted();
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      <Field
        label={
          <>
            Tasdiqlash uchun <strong className="font-semibold">{company.name}</strong> deb yozing
          </>
        }
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          placeholder={company.name}
          disabled={deleting}
        />
      </Field>
      <Dialog.Footer>
        <Button variant="soft" onClick={onCancel} disabled={deleting}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="danger" disabled={!matches} loading={deleting}>
          Hisobni o&apos;chirish
        </Button>
      </Dialog.Footer>
    </form>
  );
}
