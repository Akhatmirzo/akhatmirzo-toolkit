'use client';

import { isValidEmail, parsePhone } from '@akhatmirzo/core';
import {
  Avatar,
  Button,
  Combobox,
  ConfirmDialog,
  DatePicker,
  Drawer,
  Field,
  FileUpload,
  Input,
  PhoneInput,
  Radio,
  RadioGroup,
  Select,
} from '@akhatmirzo/ui';
import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react';
import {
  departments,
  roles,
  statuses,
  type DepartmentId,
  type Employee,
  type EmployeeStatus,
  type Role,
} from '../data';
import { fakeRequest } from '../store';
import { fromIsoDate, toIsoDate, uploadAvatar } from '../utils';

export type EmployeeDraft = Omit<Employee, 'id' | 'invited'>;

interface FormValues {
  name: string;
  email: string;
  phone: string;
  title: string;
  department: DepartmentId | '';
  managerId: string | null;
  joinedAt: Date | null;
  role: Role;
  status: EmployeeStatus;
  location: string;
  avatar?: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

function toValues(e?: Employee): FormValues {
  return {
    name: e?.name ?? '',
    email: e?.email ?? '',
    phone: e?.phone ?? '',
    title: e?.title ?? '',
    department: e?.department ?? '',
    managerId: e?.managerId ?? null,
    joinedAt: e ? fromIsoDate(e.joinedAt) : null,
    role: e?.role ?? 'viewer',
    status: e?.status ?? 'active',
    location: e?.location ?? 'Toshkent',
    avatar: e?.avatar,
  };
}

function validate(v: FormValues, others: Employee[], dateError: string | null): Errors {
  const errors: Errors = {};
  const name = v.name.trim();
  if (!name) errors.name = 'Ism-familiyani kiriting';
  else if (name.length < 3) errors.name = 'Kamida 3 ta harf';

  const email = v.email.trim().toLowerCase();
  if (!email) errors.email = 'Email manzilini kiriting';
  else if (!isValidEmail(email)) errors.email = "Email noto'g'ri: masalan, ism@bulut.uz";
  else if (others.some((o) => o.email.toLowerCase() === email))
    errors.email = "Bu email bilan xodim allaqachon ro'yxatda bor";

  if (!v.phone) errors.phone = 'Telefon raqamini kiriting';
  else if (!parsePhone(v.phone).valid)
    errors.phone = "Raqam to'liq emas yoki operator kodi noto'g'ri";

  if (!v.title.trim()) errors.title = 'Lavozimni kiriting';
  if (!v.department) errors.department = "Bo'limni tanlang";
  if (dateError) errors.joinedAt = dateError;
  else if (!v.joinedAt) errors.joinedAt = 'Ishga kirgan sanani tanlang';
  return errors;
}

interface EmployeeFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tahrirlanayotgan xodim (bo'lmasa — yangi) */
  employee?: Employee;
  employees: Employee[];
  onSubmit: (draft: EmployeeDraft) => void;
}

/** Xodim qo'shish va tahrirlash — bitta forma, o'ngdan chiqadigan Drawer'da */
export function EmployeeFormDrawer({
  open,
  onOpenChange,
  employee,
  employees,
  onSubmit,
}: EmployeeFormDrawerProps) {
  const dirtyRef = useRef(false);

  // Forma o'zgargan bo'lsa, yopishdan oldin so'raymiz (Esc, tashqariga bosish, "Bekor qilish")
  const [confirmClose, setConfirmClose] = useState(false);

  const requestOpenChange = (next: boolean) => {
    if (next || !dirtyRef.current) onOpenChange(next);
    else setConfirmClose(true);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={requestOpenChange}>
        <Drawer.Content
          size="lg"
          title={employee ? 'Xodimni tahrirlash' : "Xodim qo'shish"}
          description={
            employee
              ? `${employee.name} ma'lumotlarini yangilang.`
              : 'Yangi xodimga emailiga taklif yuboriladi. Qabul qilgach, u tizimga kira oladi.'
          }
        >
          <EmployeeForm
            employee={employee}
            employees={employees}
            dirtyRef={dirtyRef}
            onCancel={() => requestOpenChange(false)}
            onSubmit={(draft) => {
              dirtyRef.current = false;
              setConfirmClose(false);
              onSubmit(draft);
              onOpenChange(false);
            }}
          />
        </Drawer.Content>
      </Drawer>
      <ConfirmDialog
        open={confirmClose && open}
        onOpenChange={setConfirmClose}
        title="O'zgarishlar saqlanmaydi"
        description="Formani yopsangiz, kiritilgan ma'lumotlar yo'qoladi."
        confirmText="Yopish"
        cancelText="Davom etish"
        variant="danger"
        onConfirm={() => {
          dirtyRef.current = false;
          onOpenChange(false);
        }}
      />
    </>
  );
}

function EmployeeForm({
  employee,
  employees,
  dirtyRef,
  onCancel,
  onSubmit,
}: {
  employee?: Employee;
  employees: Employee[];
  dirtyRef: RefObject<boolean>;
  onCancel: () => void;
  onSubmit: (draft: EmployeeDraft) => void;
}) {
  const initial = useMemo(() => toValues(employee), [employee]);
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const others = useMemo(
    () => employees.filter((e) => e.id !== employee?.id),
    [employees, employee],
  );
  const errors = validate(values, others, dateError);
  const shown: Errors = submitted ? errors : {};

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty, dirtyRef]);

  const managerOptions = useMemo(
    () =>
      others
        .filter((e) => e.status !== 'left')
        .map((e) => ({ value: e.id, label: e.name, description: e.title })),
    [others],
  );

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, today.getDate());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      // Birinchi xato maydonga fokus
      const form = e.currentTarget as HTMLFormElement;
      requestAnimationFrame(() =>
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      );
      return;
    }
    setSaving(true);
    await fakeRequest(700);
    setSaving(false);
    onSubmit({
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      phone: parsePhone(values.phone).digits,
      title: values.title.trim(),
      department: values.department as DepartmentId,
      managerId: values.managerId,
      joinedAt: toIsoDate(values.joinedAt as Date),
      role: values.role,
      status: values.status,
      location: values.location,
      avatar: values.avatar,
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-1 flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar size="xl" name={values.name || '?'} src={values.avatar} />
        <div className="flex flex-col gap-2">
          <FileUpload
            variant="button"
            accept={['image/*']}
            maxSize={5 * 1024 * 1024}
            upload={uploadAvatar}
            labels={{ button: 'Rasm yuklash' }}
            hint="JPG yoki PNG, 5 MB gacha"
            aria-label="Xodim rasmi"
            onFilesChange={(items) => {
              setUploading(items.some((it) => it.status === 'uploading'));
              const done = items.findLast((it) => it.status === 'done');
              if (typeof done?.result === 'string' && done.result !== values.avatar)
                set('avatar', done.result);
            }}
          />
          {values.avatar && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="self-start text-danger-soft-foreground"
              onClick={() => set('avatar', undefined)}
            >
              Rasmni olib tashlash
            </Button>
          )}
        </div>
      </div>

      <Field label="Ism-familiya" required error={shown.name}>
        <Input
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="Masalan, Aziza Karimova"
          autoComplete="off"
          data-autofocus
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" required error={shown.email}>
          <Input
            type="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="ism@bulut.uz"
            autoComplete="off"
          />
        </Field>
        <Field label="Telefon" required error={shown.phone}>
          <PhoneInput value={values.phone} onValueChange={(v) => set('phone', v)} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Lavozim" required error={shown.title}>
          <Input
            value={values.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Masalan, Frontend dasturchi"
          />
        </Field>
        <Field label="Bo'lim" required error={shown.department}>
          <Select
            value={values.department || undefined}
            onValueChange={(v) => set('department', v as DepartmentId)}
            placeholder="Bo'limni tanlang"
          >
            {departments.map((d) => (
              <Select.Item key={d.id} value={d.id}>
                {d.label}
              </Select.Item>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Rahbar" description="Kimga hisobot beradi">
          <Combobox
            options={managerOptions}
            value={values.managerId}
            onValueChange={(v) => set('managerId', v)}
            placeholder="Rahbarni tanlang"
            searchPlaceholder="Ism bo'yicha qidirish..."
            clearable
          />
        </Field>
        <Field label="Ishga kirgan sana" required error={shown.joinedAt}>
          <DatePicker
            value={values.joinedAt}
            onValueChange={(d) => set('joinedAt', d)}
            maxDate={maxDate}
            onErrorChange={(err) =>
              setDateError(
                err === 'invalid'
                  ? "Sana noto'g'ri: kk.oo.yyyy"
                  : err === 'unavailable'
                    ? "Sana 2 oydan uzoq bo'lmasligi kerak"
                    : null,
              )
            }
          />
        </Field>
      </div>

      {employee && (
        <Field label="Holat">
          <Select value={values.status} onValueChange={(v) => set('status', v as EmployeeStatus)}>
            {statuses.map((s) => (
              <Select.Item key={s.id} value={s.id}>
                {s.label}
              </Select.Item>
            ))}
          </Select>
        </Field>
      )}

      <Field label="Rol" description="Xodim tizimda nimalarni qila olishini belgilaydi">
        <RadioGroup
          variant="card"
          value={values.role}
          onValueChange={(v) => set('role', v as Role)}
        >
          {roles.map((r) => (
            <Radio key={r.id} value={r.id} label={r.label} description={r.description} />
          ))}
        </RadioGroup>
      </Field>

      <Drawer.Footer className="sticky -bottom-6 z-10 -mx-6 mt-auto -mb-6 border-t border-border bg-surface px-6 py-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="primary" loading={saving} disabled={uploading}>
          {employee ? 'Saqlash' : 'Taklif yuborish'}
        </Button>
      </Drawer.Footer>
    </form>
  );
}
