'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Download, MessageSquare, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatDate, getStatusColor, getStatusLabel, formatPrice } from '@/lib/utils';
import { Order } from '@/types';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: ordersData } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders/my');
      return data.data as Order[];
    },
  });

  const { data: ticketsData } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/tickets/my');
      return data.data;
    },
  });

  const orders = ordersData || [];
  const tickets = ticketsData || [];
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const stats = [
    { icon: ShoppingBag, label: 'سفارش‌ها', value: orders.length, href: '/dashboard/orders', color: 'text-indigo-400 bg-indigo-400/10' },
    { icon: Download, label: 'دانلودها', value: completedOrders.length, href: '/dashboard/downloads', color: 'text-sky-400 bg-sky-400/10' },
    { icon: Key, label: 'لایسنس‌ها', value: completedOrders.length, href: '/dashboard/licenses', color: 'text-emerald-400 bg-emerald-400/10' },
    { icon: MessageSquare, label: 'تیکت‌ها', value: tickets.length, href: '/dashboard/tickets', color: 'text-amber-400 bg-amber-400/10' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white mb-1">
          سلام، {user?.firstName || 'کاربر'} 👋
        </h1>
        <p className="text-slate-400">خلاصه‌ای از حساب کاربری شما</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="card p-5 hover:border-white/[0.1] transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">سفارش‌های اخیر</h2>
          <Link href="/dashboard/orders" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
            همه سفارش‌ها
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {orders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">هنوز سفارشی ثبت نکرده‌اید</p>
              <Link href="/products" className="btn-primary mt-4 text-sm">
                مشاهده محصولات
              </Link>
            </div>
          ) : (
            orders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                    <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="text-white text-sm font-semibold">{formatPrice(parseFloat(order.totalAmount))}</div>
                  <div className="text-slate-500 text-xs">{order.items?.length} محصول</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
