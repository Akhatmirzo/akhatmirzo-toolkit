'use client';

import { Button, toast } from '@akhatmirzo/ui';

export default function ToastStack() {
  const burst = () => {
    toast.info("Yangi mijoz ro'yxatdan o'tdi");
    toast.success("To'lov qabul qilindi", { description: "350 000 so'm" });
    toast.warning('Omborda 3 ta qoldi');
    toast('Yangi sharh qoldirildi');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={burst}>
        4 tasini birdan
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Hammasini yopish
      </Button>
    </div>
  );
}
