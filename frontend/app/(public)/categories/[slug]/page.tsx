'use client';

import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { Product, Category } from '@/types';

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { data: categoryData } = useQuery({
    queryKey: ['category', params.slug],
    queryFn: async () => {
      const { data } = await api.get(`/categories/${params.slug}`);
      return data.data as Category;
    },
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-by-category', params.slug, categoryData?.id],
    queryFn: async () => {
      if (!categoryData?.id) return null;
      const { data } = await api.get(`/products?categoryId=${categoryData.id}&limit=20`);
      return data;
    },
    enabled: !!categoryData?.id,
  });

  const products: Product[] = productsData?.data || [];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {categoryData?.name || 'دسته‌بندی'}
            </h1>
            {categoryData?.description && (
              <p className="text-slate-400">{categoryData.description}</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400">محصولی در این دسته‌بندی وجود ندارد</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
