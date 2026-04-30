'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, ExternalLink, Clock } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Order } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DownloadsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-orders-for-download'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data.data as Order[];
    },
  });

  const completedOrders = (data || []).filter((o) => o.status === 'completed');

  const generateLinkMutation = useMutation({
    mutationFn: async ({ fileId, orderId }: { fileId: string; orderId: string }) => {
      const { data } = await api.post(`/downloads/generate/${fileId}`, { orderId });
      return data.data;
    },
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">دانلودها</h1>
        <p className="text-slate-400">فایل‌های قابل دانلود محصولات خریداری شده</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : completedOrders.length === 0 ? (
        <div className="card text-center py-20">
          <Download className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">فایلی برای دانلود وجود ندارد</h3>
          <p className="text-slate-400 mb-6">پس از خرید محصول، فایل‌های آن اینجا نمایش داده می‌شوند</p>
          <Link href="/products" className="btn-primary">مشاهده محصولات</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map((order) => (
            <div key={order.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white font-semibold">{order.orderNumber}</p>
                  <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-500/10 rounded-xl flex items-center justify-center">
                        <Download className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{item.productTitle}</p>
                        <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>لینک ۱ ساعته</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => generateLinkMutation.mutate({
                        fileId: item.productId, // In real app, would be fileId
                        orderId: order.id,
                      })}
                      disabled={generateLinkMutation.isPending}
                      className="btn-secondary text-sm py-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      دریافت لینک دانلود
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
