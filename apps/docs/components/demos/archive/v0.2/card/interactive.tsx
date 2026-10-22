'use client';

import { Card } from '@akhatmirzo/ui';

const reports = [
  { title: 'Sotuvlar', description: "Oktyabr · 48 250 000 so'm" },
  { title: 'Mijozlar', description: '1 204 ta faol mijoz' },
];

export default function CardInteractive() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {reports.map((report) => (
        <Card key={report.title} variant="outline" interactive asChild>
          <a href="#props">
            <Card.Header title={report.title} description={report.description} />
          </a>
        </Card>
      ))}
    </div>
  );
}
