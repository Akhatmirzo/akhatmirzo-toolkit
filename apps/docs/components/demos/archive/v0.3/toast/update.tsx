'use client';

import { Button, toast } from '@akhatmirzo/ui';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ToastUpdate() {
  const upload = async () => {
    const id = toast.loading('Fayl yuklanmoqda...', { description: 'hisobot.xlsx' });
    await wait(1000);
    toast.loading('Fayl tekshirilmoqda...', { id, description: 'hisobot.xlsx' });
    await wait(1000);
    toast.success('Fayl yuklandi', { id, description: 'hisobot.xlsx · 2,4 MB' });
  };

  return (
    <Button variant="outline" onClick={upload}>
      Faylni yuklash
    </Button>
  );
}
