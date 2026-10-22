'use client';

import { Button, Drawer } from '@akhatmirzo/ui';

const rows = [
  ['Mijoz', 'Sarvar Abduxoliqov'],
  ['Telefon', '+998 90 123 45 67'],
  ['Manzil', 'Toshkent, Chilonzor tumani, 9-mavze'],
  ["To'lov", 'Naqd, yetkazib berilganda'],
  ['Jami', "1 250 000 so'm"],
];

export default function DrawerDetails() {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <Button>Buyurtma #1042</Button>
      </Drawer.Trigger>
      <Drawer.Content size="lg" title="Buyurtma #1042" description="21-oktabr, 14:32">
        <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-text-muted">{label}</dt>
              <dd className="m-0 font-medium text-text">{value}</dd>
            </div>
          ))}
        </dl>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Yopish</Button>
          </Drawer.Close>
          <Button variant="primary">Yetkazildi deb belgilash</Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
