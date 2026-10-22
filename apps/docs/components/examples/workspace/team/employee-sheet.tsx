'use client';

import { formatDate, formatPhone } from '@akhatmirzo/core';
import { Avatar, Badge, Button, Drawer } from '@akhatmirzo/ui';
import {
  Briefcase,
  Calendar,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { roleById, type Employee } from '../data';
import { fromIsoDate, tenure } from '../utils';
import { DepartmentBadge, StatusBadge } from './columns';

interface EmployeeSheetProps {
  employee: Employee | null;
  employees: Employee[];
  onClose: () => void;
  onSelect: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

/** Xodim kartasi: o'ngdan chiqadigan panel, rahbar va bo'ysunuvchilar orasida yurish mumkin */
export function EmployeeSheet({
  employee,
  employees,
  onClose,
  onSelect,
  onEdit,
  onDelete,
}: EmployeeSheetProps) {
  return (
    <Drawer open={employee !== null} onOpenChange={(open) => !open && onClose()}>
      {employee && (
        <Drawer.Content size="md" title="Xodim kartasi" hideTitle>
          <SheetBody
            employee={employee}
            employees={employees}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </Drawer.Content>
      )}
    </Drawer>
  );
}

function SheetBody({
  employee: e,
  employees,
  onSelect,
  onEdit,
  onDelete,
}: Omit<EmployeeSheetProps, 'employee' | 'onClose'> & { employee: Employee }) {
  const manager = employees.find((m) => m.id === e.managerId);
  const reports = employees.filter((m) => m.managerId === e.id);
  const role = roleById[e.role];

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar size="xl" name={e.name} src={e.avatar} className="size-20 text-2xl" />
        <div>
          <h2 className="text-xl font-semibold">{e.name}</h2>
          <p className="text-sm text-text-muted">{e.title}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          <StatusBadge status={e.status} />
          <DepartmentBadge id={e.department} />
          {e.invited && <Badge color="info">Taklif yuborilgan</Badge>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <Button variant="soft" leftIcon={<Mail aria-hidden="true" />} asChild>
          <a href={`mailto:${e.email}`}>Xat yozish</a>
        </Button>
        <Button variant="outline" leftIcon={<Phone aria-hidden="true" />} asChild>
          <a href={`tel:+998${e.phone}`}>Qo&apos;ng&apos;iroq</a>
        </Button>
      </div>

      <dl className="mt-6 divide-y divide-border rounded-xl border border-border">
        <InfoRow icon={<Mail />} label="Email">
          <a href={`mailto:${e.email}`} className="text-link hover:underline">
            {e.email}
          </a>
        </InfoRow>
        <InfoRow icon={<Phone />} label="Telefon">
          <span className="tabular-nums">{formatPhone(e.phone)}</span>
        </InfoRow>
        <InfoRow icon={<Briefcase />} label="Lavozim">
          {e.title}
        </InfoRow>
        <InfoRow icon={<ShieldCheck />} label="Rol">
          {role.label}
          <span className="block text-xs text-text-muted">{role.description}</span>
        </InfoRow>
        <InfoRow icon={<Calendar />} label="Ishga kirgan">
          {formatDate(fromIsoDate(e.joinedAt), 'd MMMM yyyy')}
          <span className="block text-xs text-text-muted">{tenure(e.joinedAt)}</span>
        </InfoRow>
        <InfoRow icon={<MapPin />} label="Shahar">
          {e.location}
        </InfoRow>
        <InfoRow icon={<UserRound />} label="Rahbar">
          {manager ? <PersonLink person={manager} onSelect={onSelect} /> : '—'}
        </InfoRow>
      </dl>

      <section aria-labelledby="reports-title" className="mt-6">
        <h3 id="reports-title" className="mb-2 text-sm font-semibold">
          Bo&apos;ysunuvchilar{' '}
          <span className="font-normal text-text-muted">({reports.length})</span>
        </h3>
        {reports.length === 0 ? (
          <p className="text-sm text-text-muted">Bu xodimga hech kim hisobot bermaydi.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {reports.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => onSelect(r.id)}
                  className="focus-ring flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors duration-fast hover:bg-surface-muted"
                >
                  <Avatar size="xs" name={r.name} src={r.avatar} />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{r.name}</span>
                  <span className="truncate text-xs text-text-muted">{r.title}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Drawer.Footer>
        <Button
          variant="ghost"
          className="mr-auto text-danger-soft-foreground"
          leftIcon={<Trash2 aria-hidden="true" />}
          onClick={() => onDelete(e)}
        >
          O&apos;chirish
        </Button>
        <Button variant="primary" onClick={() => onEdit(e)}>
          Tahrirlash
        </Button>
      </Drawer.Footer>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-3 px-4 py-3 text-sm">
      <span aria-hidden="true" className="mt-0.5 text-text-faint [&_svg]:size-4">
        {icon}
      </span>
      <dt className="w-24 shrink-0 text-text-muted">{label}</dt>
      <dd className="min-w-0 flex-1 break-words">{children}</dd>
    </div>
  );
}

function PersonLink({ person, onSelect }: { person: Employee; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(person.id)}
      className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-md text-left font-medium text-link hover:underline"
    >
      <Avatar size="xs" name={person.name} src={person.avatar} />
      {person.name}
    </button>
  );
}
