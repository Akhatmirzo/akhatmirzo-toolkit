'use client';

import { Badge, Button } from '@akhatmirzo/ui';
import { useState } from 'react';

const initial = ['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona"];

export default function BadgeRemovable() {
  const [cities, setCities] = useState(initial);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {cities.map((city) => (
        <Badge
          key={city}
          variant="outline"
          onRemove={() => setCities((list) => list.filter((c) => c !== city))}
          labels={{ remove: `${city} filtrini olib tashlash` }}
        >
          {city}
        </Badge>
      ))}
      {cities.length < initial.length && (
        <Button variant="link" size="sm" onClick={() => setCities(initial)}>
          Qaytarish
        </Button>
      )}
    </div>
  );
}
