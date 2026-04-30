'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Order } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data.data as Order[];
    },
  });

  const orders = data || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">سفارش‌ها</h1>
        <p className="text-slate-400">تاریخچه خریدهای شما</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-20">
          <ShoppingBag className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">هنوز سفارشی ندارید</h3>
          <p className="text-slate-400 mb-6">محصولات ما را مشاهده کنید</p>
          <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                  <Link href={`/dashboard/orders/${order.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                    جزئیات <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
              <div className="border-t border-white/[0.04] pt-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <span className="text-slate-300 text-sm">{item.productTitle}</span>
                    <span className="text-white text-sm font-medium">{formatPrice(parseFloat(item.price))}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.04] mt-2">
                  <span className="text-slate-400 text-sm">مجموع</span>
                  <span className="text-white font-bold">{formatPrice(parseFloat(order.totalAmount))}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
