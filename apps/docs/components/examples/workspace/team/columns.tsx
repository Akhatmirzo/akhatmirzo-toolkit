'use client';

import { formatDate, formatPhone } from '@akhatmirzo/core';
import { Avatar, Badge, type DataTableColumn } from '@akhatmirzo/ui';
import { departmentById, departments, roleById, roles, statusById, type Employee } from '../data';
import { fromIsoDate } from '../utils';

/** Xodim: rasm, ism, email va "taklif yuborildi" belgisi */
export function EmployeeCell({ employee }: { employee: Employee }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm" name={employee.name} src={employee.avatar} />
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-medium">
          <span className="truncate">{employee.name}</span>
          {employee.invited && (
            <Badge size="sm" color="info">
              Taklif
            </Badge>
          )}
        </p>
        <p className="truncate text-xs text-text-muted">{employee.email}</p>
      </div>
    </div>
  );
}

export function DepartmentBadge({ id }: { id: Employee['department'] }) {
  const dep = departmentById[id];
  return (
    <Badge color={dep.color} dot>
      {dep.label}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Employee['status'] }) {
  const s = statusById[status];
  return (
    <Badge color={s.color} variant={status === 'left' ? 'outline' : 'soft'}>
      {s.label}
    </Badge>
  );
}

/** Jadval ustunlari. `managerName` — rahbar ustuni uchun id → ism */
export function buildColumns(
  managerName: (id: string | null) => string,
): DataTableColumn<Employee>[] {
  return [
    {
      key: 'name',
      header: 'Xodim',
      sortable: true,
      hideable: false,
      width: 260,
      searchValue: (e) => `${e.name} ${e.email}`,
      cell: (e) => <EmployeeCell employee={e} />,
    },
    { key: 'title', header: 'Lavozim', sortable: true },
    {
      key: 'department',
      header: "Bo'lim",
      sortable: true,
      filter: 'multiselect',
      filterOptions: departments.map((d) => ({ value: d.id, label: d.label })),
      accessor: (e) => e.department,
      searchValue: (e) => departmentById[e.department].label,
      cell: (e) => <DepartmentBadge id={e.department} />,
    },
    {
      key: 'status',
      header: 'Holat',
      searchable: false,
      cell: (e) => <StatusBadge status={e.status} />,
    },
    {
      key: 'role',
      header: 'Rol',
      filter: 'multiselect',
      filterOptions: roles.map((r) => ({ value: r.id, label: r.label })),
      searchValue: (e) => roleById[e.role].label,
      cell: (e) => roleById[e.role].label,
    },
    {
      key: 'joinedAt',
      header: "Qo'shilgan",
      sortable: true,
      filter: 'date',
      filterLabel: "Qo'shilgan sana",
      accessor: (e) => fromIsoDate(e.joinedAt),
      cell: (e) => (
        <span className="whitespace-nowrap tabular-nums">
          {formatDate(fromIsoDate(e.joinedAt), 'd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon',
      searchValue: (e) => `${e.phone} ${formatPhone(e.phone)}`,
      cell: (e) => <span className="whitespace-nowrap tabular-nums">{formatPhone(e.phone)}</span>,
    },
    {
      key: 'manager',
      header: 'Rahbar',
      hidden: true,
      sortable: true,
      accessor: (e) => managerName(e.managerId),
    },
    { key: 'location', header: 'Shahar', hidden: true, sortable: true },
  ];
}
