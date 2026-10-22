'use client';

import { Field, TagInput } from '@akhatmirzo/ui';

const cities = ['Toshkent', 'Samarqand', 'Buxoro', "Farg'ona", 'Namangan', 'Andijon', 'Xiva'];

export default function TagInputSuggestions() {
  return (
    <div className="w-full max-w-md">
      <Field label="Shaharlar" description="Ko'pi bilan 4 ta. «тош» deb yozib ko'ring">
        <TagInput suggestions={cities} maxTags={4} placeholder="Shahar yozing" />
      </Field>
    </div>
  );
}
