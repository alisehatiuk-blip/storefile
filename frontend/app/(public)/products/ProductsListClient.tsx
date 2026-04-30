'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Product, Category } from '@/types';

const sortOptions = [
  { value: 'createdAt:desc', label: 'جدیدترین' },
  { value: 'createdAt:asc', label: 'قدیمی‌ترین' },
  { value: 'price:asc', label: 'ارزان‌ترین' },
  { value: 'price:desc', label: 'گران‌ترین' },
];

export default function ProductsListClient() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [sortField, sortOrder] = sortBy.split(':');

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', page, search, selectedCategory, sortField, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
        ...(selectedCategory && { categoryId: selectedCategory }),
        sortBy: sortField,
        sortOrder,
      });
      const { data } = await api.get(`/products?${params}`);
      return data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data;
    },
  });

  const products: Product[] = productsData?.data || [];
  const pagination = productsData?.pagination;
  const categories: Category[] = categoriesData?.data || [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="lg:w-64 flex-shrink-0">
        <button
          className="lg:hidden w-full flex items-center justify-between px-4 py-3 card mb-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="font-medium">فیلترها</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        <div className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-4`}>
          {/* Search */}
          <div className="card p-4">
            <label className="text-white text-sm font-medium mb-3 block">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="نام محصول..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="input pr-9 text-sm"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="card p-4">
            <label className="text-white text-sm font-medium mb-3 block">دسته‌بندی</label>
            <div className="space-y-1">
              <button
                onClick={() => { setSelectedCategory(''); setPage(1); }}
                className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedCategory === '' ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                همه دسته‌ها
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === cat.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="card p-4">
            <label className="text-white text-sm font-medium mb-3 block">مرتب‌سازی</label>
            <div className="space-y-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === opt.value ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-white text-xl font-semibold mb-2">محصولی یافت نشد</h3>
            <p className="text-slate-400">جستجو یا فیلترهای خود را تغییر دهید</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-400 text-sm">
                {pagination?.total?.toLocaleString('fa-IR')} محصول
              </p>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 card text-sm text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  قبلی
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                      page === p
                        ? 'bg-indigo-600 text-white'
                        : 'card text-slate-400 hover:text-white hover:border-indigo-500/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 card text-sm text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  بعدی
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
