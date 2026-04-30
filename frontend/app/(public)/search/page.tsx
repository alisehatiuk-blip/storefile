'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import api from '@/lib/api';
import { Product } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const handleSearch = (value: string) => {
    setQuery(value);
    const timer = setTimeout(() => setDebouncedQuery(value), 400);
    return () => clearTimeout(timer);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { data: [] };
      const { data } = await api.get(`/products?search=${encodeURIComponent(debouncedQuery)}&limit=20`);
      return data;
    },
    enabled: !!debouncedQuery,
  });

  const products: Product[] = data?.data || [];

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Search hero */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-8">جستجو در محصولات</h1>
            <div className="relative">
              <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="نام محصول، تکنولوژی یا کلیدواژه..."
                className="input text-lg py-4 pr-12"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : debouncedQuery && products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-white text-xl font-semibold mb-2">نتیجه‌ای یافت نشد</h3>
              <p className="text-slate-400">کلیدواژه دیگری امتحان کنید</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <p className="text-slate-400 mb-6">{products.length} نتیجه برای "{debouncedQuery}"</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              برای شروع جستجو، عبارتی را تایپ کنید
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
