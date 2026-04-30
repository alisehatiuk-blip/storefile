'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, Search, Package } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        ...(search && { search }),
        ...(status && { status }),
      });
      const { data } = await api.get(`/products?${params}`);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = (id: string, title: string) => {
    if (confirm(`آیا مطمئن هستید که می‌خواهید "${title}" را حذف کنید؟`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{pagination?.total || 0} محصول</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          محصول جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجو در محصولات..."
            className="input pr-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input w-40"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="published">منتشر شده</option>
          <option value="draft">پیش‌نویس</option>
          <option value="archived">بایگانی</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500">در حال بارگذاری...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">محصولی یافت نشد</p>
            <Link href="/dashboard/products/new" className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              اولین محصول را اضافه کنید
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right p-4 text-slate-400 text-xs font-medium">محصول</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">قیمت</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden lg:table-cell">دسته‌بندی</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">وضعیت</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">دانلود</th>
                <th className="p-4 text-slate-400 text-xs font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm font-medium line-clamp-1">{product.title}</p>
                      <p className="text-slate-500 text-xs">v{product.version}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-slate-300 text-sm">{formatPrice(parseFloat(product.price))}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {product.categories?.slice(0, 2).map((cat: any) => (
                        <span key={cat.id} className="badge bg-slate-800 text-slate-400 text-xs">{cat.name}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`badge text-xs ${getStatusColor(product.status)}`}>
                      {getStatusLabel(product.status)}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{product.downloadCount}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <a
                        href={`http://localhost:3000/products/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        title="مشاهده"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">قبلی</button>
          <span className="text-slate-400 text-sm">{page} از {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary disabled:opacity-40">بعدی</button>
        </div>
      )}
    </div>
  );
}
