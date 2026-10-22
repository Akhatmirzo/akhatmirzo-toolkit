import type { ReactNode } from 'react';
import { CheckoutProvider } from '@/components/examples/checkout/store';
import { StoreFooter } from '@/components/examples/checkout/store-footer';
import { StoreHeader } from '@/components/examples/checkout/store-header';
import { ExampleBar } from '@/components/examples/shared/example-bar';

/** "Bozorcha" do'koni: holat (savatcha, manzil, buyurtmalar) barcha ichki sahifalarga umumiy */
export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <CheckoutProvider>
      <div className="print:hidden">
        <ExampleBar slug="checkout" />
        <StoreHeader />
      </div>
      {children}
      <StoreFooter />
    </CheckoutProvider>
  );
}
