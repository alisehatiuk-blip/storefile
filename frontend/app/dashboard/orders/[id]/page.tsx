'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, ShoppingBag, Download, Key } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${params.id}`);
      return data.data;
    },
  });

  if (isLoading) return <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>;
  if (!data) return <div className="p-8 text-center" style={{ color: '#64748b' }}>سفارش یافت نشد</div>;

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/orders" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: '#64748b' }}>
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{data.orderNumber}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs" style={{ color: '#475569' }}>{formatDate(data.createdAt)}</span>
            <span className={`badge text-xs ${getStatusColor(data.status)}`}>{getStatusLabel(data.status)}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card mb-4">
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-white font-semibold flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" style={{ color: '#6366f1' }} />
            محصولات سفارش
          </h2>
        </div>
        <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as any}>
          {(data.items || []).map((item: any) => (
            <div key={item.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{item.productTitle}</p>
                {item.includesSupport && (
                  <p className="text-xs mt-0.5" style={{ color: '#10b981' }}>+ پشتیبانی یک‌ساله</p>
                )}
              </div>
              <p className="text-white font-semibold">{formatPrice(parseFloat(item.price))}</p>
            </div>
          ))}
          <div className="p-4 flex justify-between" style={{ background: 'rgba(99,102,241,0.04)' }}>
            <span className="text-white font-bold">مجموع</span>
            <span className="text-white font-bold">{formatPrice(parseFloat(data.totalAmount))}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="card p-5">
        <h2 className="text-white font-semibold mb-4">اطلاعات پرداخت</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span style={{ color: '#64748b' }}>روش پرداخت</span>
            <span className="text-white">{data.paymentMethod === 'mock' ? 'پرداخت آزمایشی' : data.paymentMethod}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: '#64748b' }}>وضعیت پرداخت</span>
            <span className={`badge text-xs ${getStatusColor(data.paymentStatus)}`}>{getStatusLabel(data.paymentStatus)}</span>
          </div>
          {data.paymentReference && (
            <div className="flex justify-between">
              <span style={{ color: '#64748b' }}>شماره پیگیری</span>
              <span className="text-white font-mono text-xs">{data.paymentReference}</span>
            </div>
          )}
        </div>
      </div>

      {data.status === 'completed' && (
        <div className="flex gap-3 mt-4">
          <Link href="/dashboard/downloads" className="btn-primary text-sm">
            <Download className="w-4 h-4" />
            دانلود فایل‌ها
          </Link>
          <Link href="/dashboard/licenses" className="btn-secondary text-sm">
            <Key className="w-4 h-4" />
            مشاهده لایسنس
          </Link>
        </div>
      )}
    </div>
  );
}
