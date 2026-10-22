'use client';

import { Button, toast } from '@akhatmirzo/ui';

export default function ToastTypes() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" onClick={() => toast('Havola nusxalandi')}>
        Oddiy
      </Button>
      <Button variant="outline" onClick={() => toast.success("O'zgarishlar saqlandi")}>
        success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Ulanib bo'lmadi", {
            description: "Internetni tekshirib, qayta urinib ko'ring.",
          })
        }
      >
        error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.warning('Obuna 3 kundan keyin tugaydi', {
            description: "To'lovni oldindan qiling.",
          })
        }
      >
        warning
      </Button>
      <Button variant="outline" onClick={() => toast.info('Yangi versiya mavjud')}>
        info
      </Button>
      <Button variant="outline" onClick={() => toast.loading('Hisobot tayyorlanmoqda...')}>
        loading
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Hammasini yopish
      </Button>
    </div>
  );
}
