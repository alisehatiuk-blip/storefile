'use client';

import ProductFormShared from '@/components/ui/ProductFormShared';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductFormShared productId={params.id} />;
}
