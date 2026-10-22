'use client';

import {
  Button,
  DataTable,
  DropdownMenu,
  IconButton,
  Skeleton,
  Tabs,
  confirm,
  toast,
} from '@akhatmirzo/ui';
import {
  ArrowRightLeft,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Plane,
  Send,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  departments,
  seedEmployees,
  statuses,
  type DepartmentId,
  type Employee,
  type EmployeeStatus,
} from '../data';
import { createId, fakeRequest, useWorkspace } from '../store';
import { PageHeader } from '../ui';
import { buildColumns } from './columns';
import { EmployeeFormDrawer, type EmployeeDraft } from './employee-form';
import { EmployeeSheet } from './employee-sheet';

type Tab = 'all' | EmployeeStatus;

export function TeamPage() {
  const { employees, setEmployees } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  // session — har ochilishda yangi forma (eski qoralama qolmasligi uchun)
  const [form, setForm] = useState<{ open: boolean; employee?: Employee; session: number }>({
    open: false,
    session: 0,
  });
  const [viewId, setViewId] = useState<string | null>(null);

  // Birinchi ochilishda serverdan yuklanayotgandek
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const nameById = useMemo(() => new Map(employees.map((e) => [e.id, e.name])), [employees]);
  const columns = useMemo(
    () => buildColumns((id) => (id ? (nameById.get(id) ?? '—') : '—')),
    [nameById],
  );

  const counts = useMemo(() => {
    const c: Record<Tab, number> = { all: employees.length, active: 0, vacation: 0, left: 0 };
    for (const e of employees) c[e.status] += 1;
    return c;
  }, [employees]);
  const invitedCount = employees.filter((e) => e.invited).length;
  const rows = tab === 'all' ? employees : employees.filter((e) => e.status === tab);
  const viewed = employees.find((e) => e.id === viewId) ?? null;

  /* ---------- Amallar ---------- */

  const openCreate = () => setForm((f) => ({ open: true, session: f.session + 1 }));
  const openEdit = (employee: Employee) => {
    setViewId(null);
    setForm((f) => ({ open: true, employee, session: f.session + 1 }));
  };

  const save = (draft: EmployeeDraft) => {
    const editing = form.employee;
    if (editing) {
      setEmployees((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...draft } : e)));
      toast.success("O'zgarishlar saqlandi", { description: draft.name });
    } else {
      const id = createId('e');
      setEmployees((prev) => [{ ...draft, id, status: 'active', invited: true }, ...prev]);
      toast.success('Taklif yuborildi', {
        description: `${draft.email} manziliga taklif xati jo'natildi.`,
        action: { label: "Ko'rish", onClick: () => setViewId(id) },
      });
    }
  };

  /** O'chirish: tasdiqlash → o'chirish → "Qaytarish" imkoniyati bilan toast */
  const remove = async (targets: Employee[], onDone?: () => void) => {
    const ids = new Set(targets.map((t) => t.id));
    const orphans = employees.filter((e) => e.managerId && ids.has(e.managerId) && !ids.has(e.id));
    const single = targets.length === 1 ? targets[0] : undefined;
    const ok = await confirm({
      title: single
        ? `${single.name}ni o'chirasizmi?`
        : `${targets.length} ta xodimni o'chirasizmi?`,
      description: (
        <>
          Xodim jamoadan chiqariladi va tizimga kira olmaydi.
          {orphans.length > 0 && ` ${orphans.length} ta xodimning rahbari bo'sh qoladi.`}
        </>
      ),
      confirmText: "O'chirish",
      variant: 'danger',
      onConfirm: () => fakeRequest(500),
    });
    if (!ok) return;

    const snapshot = employees;
    setEmployees((prev) =>
      prev
        .filter((e) => !ids.has(e.id))
        .map((e) => (e.managerId && ids.has(e.managerId) ? { ...e, managerId: null } : e)),
    );
    if (viewId && ids.has(viewId)) setViewId(null);
    onDone?.();
    toast.success(single ? `${single.name} o'chirildi` : `${targets.length} ta xodim o'chirildi`, {
      action: {
        label: 'Qaytarish',
        onClick: () => {
          // O'chirilganlarni va ularning bo'ysunuvchilari bog'lanishini tiklaymiz
          setEmployees((prev) => {
            const restored = snapshot.filter((e) => ids.has(e.id));
            const links = new Map(snapshot.map((e) => [e.id, e.managerId]));
            const kept = prev.map((e) =>
              e.managerId === null && links.get(e.id) && ids.has(links.get(e.id) ?? '')
                ? { ...e, managerId: links.get(e.id) ?? null }
                : e,
            );
            return [...restored, ...kept];
          });
          toast('Qaytarildi');
        },
      },
    });
  };

  const moveTo = (targets: Employee[], department: DepartmentId, onDone: () => void) => {
    const ids = new Set(targets.map((t) => t.id));
    setEmployees((prev) => prev.map((e) => (ids.has(e.id) ? { ...e, department } : e)));
    const label = departments.find((d) => d.id === department)?.label;
    toast.success(`${targets.length} ta xodim "${label}" bo'limiga o'tkazildi`);
    onDone();
  };

  const setStatus = (employee: Employee, status: EmployeeStatus) => {
    setEmployees((prev) => prev.map((e) => (e.id === employee.id ? { ...e, status } : e)));
    toast.success(`${employee.name}: holat yangilandi`, {
      description: statuses.find((s) => s.id === status)?.label,
    });
  };

  const resendInvite = (employee: Employee) =>
    toast.promise(fakeRequest(1200), {
      loading: 'Taklif yuborilmoqda...',
      success: `Taklif ${employee.email} manziliga qayta yuborildi`,
      error: "Yuborib bo'lmadi",
    });

  const restoreSample = () => {
    setEmployees(seedEmployees);
    toast.success('Namuna xodimlar tiklandi');
  };

  /* ---------- Ko'rinish ---------- */

  const emptyByTab: Record<Tab, { title: string; description: string }> = {
    all: {
      title: "Jamoada hali hech kim yo'q",
      description: "Birinchi xodimni qo'shing yoki namuna ma'lumotlarini tiklang.",
    },
    active: {
      title: "Faol xodimlar yo'q",
      description: "Barcha xodimlar ta'tilda yoki ishdan ketgan.",
    },
    vacation: {
      title: "Hozir hech kim ta'tilda emas",
      description: "Xodim holatini \"Ta'tilda\" ga o'zgartirsangiz, u shu yerda ko'rinadi.",
    },
    left: {
      title: "Ishdan ketganlar yo'q",
      description: 'Jamoangiz barqaror — hech kim ketmagan.',
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Xodimlar"
        description="Jamoa a'zolarini boshqaring: taklif yuboring, rol va bo'limlarini o'zgartiring."
        actions={
          <Button variant="primary" leftIcon={<UserPlus aria-hidden="true" />} onClick={openCreate}>
            Xodim qo&apos;shish
          </Button>
        }
      />

      <ul aria-label="Jamoa statistikasi" className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat icon={<Users />} label="Jami xodimlar" value={counts.all} loading={loading} />
        <Stat
          icon={<UserCheck />}
          label="Faol"
          value={counts.active}
          loading={loading}
          tone="success"
        />
        <Stat
          icon={<Plane />}
          label="Ta'tilda"
          value={counts.vacation}
          loading={loading}
          tone="warning"
        />
        <Stat
          icon={<Send />}
          label="Taklif kutilmoqda"
          value={invitedCount}
          loading={loading}
          tone="info"
        />
      </ul>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <Tabs.List aria-label="Holat bo'yicha" className="mb-4">
          <Tabs.Trigger value="all" badge={counts.all}>
            Hammasi
          </Tabs.Trigger>
          {statuses.map((s) => (
            <Tabs.Trigger key={s.id} value={s.id} badge={counts[s.id]}>
              {s.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value={tab}>
          <DataTable
            label="Xodimlar ro'yxati"
            data={loading ? [] : rows}
            columns={columns}
            loading={loading}
            searchable
            selectable
            pagination={{ pageSize: 10, pageSizeOptions: [10, 25, 50] }}
            initialState={{ sorting: [{ id: 'joinedAt', desc: true }] }}
            mobileView="cards"
            labels={{ search: 'Ism, email yoki telefon...' }}
            onRowClick={(e) => setViewId(e.id)}
            empty={{
              icon: <Users aria-hidden="true" />,
              ...emptyByTab[tab],
              action:
                tab === 'all' ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      variant="primary"
                      leftIcon={<Plus aria-hidden="true" />}
                      onClick={openCreate}
                    >
                      Xodim qo&apos;shish
                    </Button>
                    <Button variant="soft" onClick={restoreSample}>
                      Namunani tiklash
                    </Button>
                  </div>
                ) : (
                  <Button variant="soft" onClick={() => setTab('all')}>
                    Barcha xodimlar
                  </Button>
                ),
            }}
            rowActions={(e) => (
              <RowActions
                employee={e}
                onView={() => setViewId(e.id)}
                onEdit={() => openEdit(e)}
                onResend={() => resendInvite(e)}
                onStatus={(s) => setStatus(e, s)}
                onDelete={() => remove([e])}
              />
            )}
            bulkActions={(selected, clear) => (
              <>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<ArrowRightLeft aria-hidden="true" />}
                    >
                      Bo&apos;limga o&apos;tkazish
                    </Button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="start">
                    <DropdownMenu.Label>Yangi bo&apos;lim</DropdownMenu.Label>
                    {departments.map((d) => (
                      <DropdownMenu.Item key={d.id} onSelect={() => moveTo(selected, d.id, clear)}>
                        {d.label}
                      </DropdownMenu.Item>
                    ))}
                  </DropdownMenu.Content>
                </DropdownMenu>
                <Button
                  size="sm"
                  variant="danger"
                  leftIcon={<Trash2 aria-hidden="true" />}
                  onClick={() => remove(selected, clear)}
                >
                  O&apos;chirish
                </Button>
              </>
            )}
          />
        </Tabs.Content>
      </Tabs>

      <EmployeeFormDrawer
        open={form.open}
        onOpenChange={(open) => setForm((f) => ({ ...f, open }))}
        key={form.session}
        employee={form.employee}
        employees={employees}
        onSubmit={save}
      />

      <EmployeeSheet
        employee={viewed}
        employees={employees}
        onClose={() => setViewId(null)}
        onSelect={setViewId}
        onEdit={openEdit}
        onDelete={(e) => remove([e])}
      />
    </div>
  );
}

function RowActions({
  employee,
  onView,
  onEdit,
  onResend,
  onStatus,
  onDelete,
}: {
  employee: Employee;
  onView: () => void;
  onEdit: () => void;
  onResend: () => void;
  onStatus: (status: EmployeeStatus) => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="ghost" size="sm" aria-label={`${employee.name}: amallar`}>
          <MoreHorizontal aria-hidden="true" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-52">
        <DropdownMenu.Item icon={<Eye />} onSelect={onView}>
          Kartani ochish
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Pencil />} onSelect={onEdit}>
          Tahrirlash
        </DropdownMenu.Item>
        <DropdownMenu.Item icon={<Send />} onSelect={onResend} disabled={!employee.invited}>
          Taklifni qayta yuborish
        </DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger icon={<UserCheck />}>
            Holatni o&apos;zgartirish
          </DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.RadioGroup
              value={employee.status}
              onValueChange={(v) => onStatus(v as EmployeeStatus)}
            >
              {statuses.map((s) => (
                <DropdownMenu.RadioItem key={s.id} value={s.id}>
                  {s.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.Item icon={<Trash2 />} variant="danger" onSelect={onDelete}>
          O&apos;chirish
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

function Stat({
  icon,
  label,
  value,
  loading,
  tone = 'primary',
}: {
  icon: ReactNode;
  label: string;
  value: number;
  loading: boolean;
  tone?: 'primary' | 'success' | 'warning' | 'info';
}) {
  const tones = {
    primary: 'bg-primary-soft text-primary-soft-foreground',
    success: 'bg-success-soft text-success-soft-foreground',
    warning: 'bg-warning-soft text-warning-soft-foreground',
    info: 'bg-info-soft text-info-soft-foreground',
  };
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-xs">
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5 ${tones[tone]}`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-text-muted sm:text-sm">{label}</p>
        {loading ? (
          <Skeleton className="mt-1 h-6 w-10" />
        ) : (
          <p className="text-xl font-semibold tabular-nums">{value}</p>
        )}
      </div>
    </li>
  );
}
