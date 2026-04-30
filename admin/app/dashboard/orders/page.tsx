'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(status && { status }) });
      const { data } = await api.get(`/orders?${params}`);
      return data;
    },
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{pagination?.total || 0} سفارش</p>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="input w-44"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="completed">تکمیل شده</option>
          <option value="pending">در انتظار</option>
          <option value="cancelled">لغو شده</option>
          <option value="refunded">برگشت داده شده</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">سفارشی یافت نشد</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right p-4 text-slate-400 text-xs font-medium">شماره سفارش</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">تاریخ</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">محصولات</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">مبلغ</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="text-white text-sm font-mono">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs">{order.userId?.slice(0, 8)}...</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{order.items?.length || 0} محصول</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-semibold">{formatPrice(parseFloat(order.totalAmount))}</span>
                  </td>
                  <td className="p-4">
                    <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
