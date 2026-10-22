'use client';

import { formatMoney } from '@akhatmirzo/core';
import { DataTable, type DataTableColumn } from '@akhatmirzo/ui';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  phone: string;
  city: string;
  salary: number;
}

const employees: Employee[] = [
  {
    id: 1,
    name: 'Sarvar Abduxoliqov',
    position: 'Frontend dasturchi',
    department: 'IT',
    phone: '+998 90 123 45 67',
    city: 'Toshkent',
    salary: 14_500_000,
  },
  {
    id: 2,
    name: "Gulnora O'rinova",
    position: 'Buxgalter',
    department: 'Moliya',
    phone: '+998 93 555 12 34',
    city: 'Samarqand',
    salary: 9_800_000,
  },
  {
    id: 3,
    name: 'Javohir Ismoilov',
    position: 'Dizayner',
    department: 'Marketing',
    phone: '+998 97 700 00 11',
    city: 'Buxoro',
    salary: 11_200_000,
  },
];

const columns: DataTableColumn<Employee>[] = [
  { key: 'name', header: 'Xodim', width: 200, hideable: false },
  { key: 'position', header: 'Lavozim' },
  { key: 'department', header: "Bo'lim" },
  { key: 'phone', header: 'Telefon', className: 'tabular-nums' },
  { key: 'city', header: 'Shahar', hidden: true },
  { key: 'salary', header: 'Maosh', numeric: true, cell: (e) => formatMoney(e.salary) },
];

export default function DataTableDensity() {
  return (
    <DataTable
      label="Xodimlar"
      data={employees}
      columns={columns}
      density="compact"
      stickyFirstColumn
      selectable
      tableClassName="min-w-[860px]"
      className="w-full"
    />
  );
}
