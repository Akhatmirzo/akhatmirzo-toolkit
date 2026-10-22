import { ProductsPage } from '@/components/examples/admin/products/products-page';
import { exampleMetadata } from '@/lib/example-pages';

export function generateMetadata({ params }: PageProps<'/[lang]/examples/admin/products'>) {
  return exampleMetadata(params, 'admin/products');
}

export default function Page() {
  return <ProductsPage />;
}
