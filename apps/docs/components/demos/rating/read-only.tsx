'use client';

import { Rating } from '@akhatmirzo/ui';

const reviews = [
  { name: 'Dilnoza', rating: 5, text: "Yetkazib berish tez, sifat zo'r." },
  { name: 'Jasur', rating: 3.5, text: "O'lchami biroz katta keldi." },
];

export default function RatingReadOnly() {
  return (
    <ul className="m-0 flex w-full max-w-sm list-none flex-col gap-4 p-0">
      {reviews.map((r) => (
        <li key={r.name} className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-text">{r.name}</span>
            <Rating value={r.rating} readOnly size="sm" />
          </div>
          <p className="m-0 text-sm text-text-muted">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}
