'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Package, ShoppingBag, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
    refetchInterval: 30000,
  });

  const stats = [
    { icon: Users, label: 'کل کاربران', value: data?.stats?.totalUsers || 0, color: 'text-blue-400 bg-blue-400/10', change: '+۱۲٪' },
    { icon: Package, label: 'کل محصولات', value: data?.stats?.totalProducts || 0, color: 'text-indigo-400 bg-indigo-400/10', change: '+۵٪' },
    { icon: ShoppingBag, label: 'کل سفارش‌ها', value: data?.stats?.totalOrders || 0, color: 'text-emerald-400 bg-emerald-400/10', change: '+۲۸٪' },
    { icon: MessageSquare, label: 'تیکت‌های باز', value: data?.stats?.openTickets || 0, color: 'text-amber-400 bg-amber-400/10', change: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Revenue banner */}
      <div className="card p-6 bg-gradient-to-l from-indigo-500/10 to-transparent border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">درآمد ۳۰ روز گذشته</p>
            <p className="text-3xl font-black text-white">
              {formatPrice(data?.stats?.monthlyRevenue || 0)}
            </p>
          </div>
          <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">
              {isLoading ? '...' : stat.value.toLocaleString('fa-IR')}
            </p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
            {stat.change && (
              <p className="text-emerald-400 text-xs mt-1 font-medium">{stat.change} این ماه</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">سفارش‌های اخیر</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">در حال بارگذاری...</div>
            ) : (data?.recentOrders || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">سفارشی موجود نیست</div>
            ) : (
              (data?.recentOrders || []).map((order: any) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{order.orderNumber}</p>
                    <p className="text-slate-500 text-xs">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-white text-sm font-semibold">
                      {formatPrice(parseFloat(order.totalAmount))}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h2 className="text-white font-semibold">فعالیت‌های اخیر</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-sm">در حال بارگذاری...</div>
            ) : (data?.recentActivity || []).length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">فعالیتی موجود نیست</div>
            ) : (
              (data?.recentActivity || []).slice(0, 8).map((log: any) => (
                <div key={log.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 text-xs font-medium">{log.action}</p>
                    <p className="text-slate-600 text-xs">{log.ipAddress} · {formatDate(log.createdAt)}</p>
                  </div>
                  <span className={`badge text-xs ${
                    log.severity === 'error' ? 'text-red-400 bg-red-400/10' :
                    log.severity === 'warning' ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-slate-400 bg-slate-400/10'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
