import type { Metadata } from 'next';
import { ProductsPage } from '@/components/examples/admin/products/products-page';

export function generateMetadata(): Metadata {
  return {
    title: "Mahsulotlar · Do'kon admin paneli",
    description: "Mahsulotlar katalogi: qidiruv, toifalar, qo'shish, tahrirlash va o'chirish.",
  };
}

export default function Page() {
  return <ProductsPage />;
}
