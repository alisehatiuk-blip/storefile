'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users, Package, ShoppingBag, MessageSquare, TrendingUp, Activity,
  ArrowUpRight, ArrowDownRight, DollarSign, Download, Eye, Clock,
} from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

const RevenueChart = dynamic(() => import('@/components/ui/RevenueChart'), { ssr: false });

const formatNum = (n: number) => n.toLocaleString('fa-IR');
const formatPrice = (n: string | number) => `${parseFloat(String(n || 0)).toLocaleString('fa-IR')} تومان`;

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.data;
    },
    refetchInterval: 30000,
  });

  const stats = data?.stats || {};

  const cards = [
    {
      label: 'کل کاربران', value: formatNum(stats.totalUsers || 0),
      icon: Users, color: '#6366f1', bg: 'rgba(99,102,241,0.12)',
      change: '+۱۲٪', up: true, link: '/dashboard/users',
    },
    {
      label: 'کل محصولات', value: formatNum(stats.totalProducts || 0),
      icon: Package, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',
      change: '+۵٪', up: true, link: '/dashboard/products',
    },
    {
      label: 'کل سفارش‌ها', value: formatNum(stats.totalOrders || 0),
      icon: ShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,0.12)',
      change: '+۲۸٪', up: true, link: '/dashboard/orders',
    },
    {
      label: 'تیکت‌های باز', value: formatNum(stats.openTickets || 0),
      icon: MessageSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
      change: stats.openTickets > 0 ? 'نیاز به پاسخ' : 'پاسخ داده شده', up: false,
      link: '/dashboard/tickets',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 4px' }}>داشبورد مدیریت</h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>
            {new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/products/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#4f46e5', color: 'white', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
            <Package style={{ width: 16, height: 16 }} />
            محصول جدید
          </Link>
        </div>
      </div>

      {/* Revenue banner */}
      <div style={{ padding: '1.5rem', borderRadius: 18, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.08))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 6px' }}>درآمد ۳۰ روز گذشته</p>
          <p style={{ color: 'white', fontWeight: 900, fontSize: '2.25rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {isLoading ? '...' : formatPrice(stats.monthlyRevenue || 0)}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ArrowUpRight style={{ width: 16, height: 16, color: '#10b981' }} />
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>۲۳٪ نسبت به ماه قبل</span>
          </div>
        </div>
        <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DollarSign style={{ width: 30, height: 30, color: '#818cf8' }} />
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map((card) => (
          <Link key={card.label} href={card.link} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon style={{ width: 20, height: 20, color: card.color }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: card.up ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                  {card.up ? <ArrowUpRight style={{ width: 14, height: 14 }} /> : <Clock style={{ width: 14, height: 14 }} />}
                  {card.change}
                </div>
              </div>
              <p style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {isLoading ? '...' : card.value}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Revenue chart */}
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'white', fontWeight: 700, margin: 0 }}>نمودار فروش</h3>
            <span style={{ fontSize: '0.75rem', color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>۷ روز گذشته</span>
          </div>
          <RevenueChart orders={data?.recentOrders || []} />
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'نرخ تبدیل', value: '۳.۲٪', icon: TrendingUp, color: '#6366f1' },
            { label: 'میانگین سفارش', value: formatPrice(stats.totalOrders > 0 ? (parseFloat(stats.monthlyRevenue || '0') / stats.totalOrders) : 0), icon: ShoppingBag, color: '#10b981' },
            { label: 'بازدیدها', value: formatNum(stats.totalViews || 0), icon: Eye, color: '#0ea5e9' },
            { label: 'دانلودها', value: formatNum(stats.totalDownloads || 0), icon: Download, color: '#f59e0b' },
          ].map(item => (
            <div key={item.label} style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <item.icon style={{ width: 18, height: 18, color: item.color }} />
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '0 0 2px' }}>{item.label}</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '0.9375rem', margin: 0 }}>{isLoading ? '...' : item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tables row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Recent orders */}
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: 'white', fontWeight: 700, margin: 0 }}>سفارش‌های اخیر</h3>
            <Link href="/dashboard/orders" style={{ color: '#6366f1', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>مشاهده همه</Link>
          </div>
          <div>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>بارگذاری...</div>
            ) : (data?.recentOrders || []).length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>سفارشی نیست</div>
            ) : (data?.recentOrders || []).slice(0, 6).map((o: any) => (
              <div key={o.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div>
                  <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, margin: '0 0 2px', fontFamily: 'monospace' }}>{o.orderNumber}</p>
                  <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{formatDate(o.createdAt)}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 20, ...colorStyle(o.status) }}>{getStatusLabel(o.status)}</span>
                  <p style={{ color: 'white', fontSize: '0.8125rem', fontWeight: 600, margin: '3px 0 0', textAlign: 'left' }}>{formatPrice(o.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity log */}
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: 'white', fontWeight: 700, margin: 0 }}>فعالیت‌های اخیر</h3>
            <Link href="/dashboard/logs" style={{ color: '#6366f1', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 600 }}>مشاهده همه</Link>
          </div>
          <div>
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.875rem' }}>بارگذاری...</div>
            ) : (data?.recentActivity || []).slice(0, 8).map((log: any) => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: log.severity === 'error' ? '#ef4444' : log.severity === 'warning' ? '#f59e0b' : '#10b981' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#e2e8f0', fontSize: '0.8125rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.action}</p>
                  <p style={{ color: '#475569', fontSize: '0.7rem', margin: 0 }}>{log.ipAddress} · {formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function colorStyle(status: string) {
  const map: Record<string, any> = {
    completed: { color: '#10b981', background: 'rgba(16,185,129,0.1)' },
    pending: { color: '#f59e0b', background: 'rgba(245,158,11,0.1)' },
    cancelled: { color: '#ef4444', background: 'rgba(239,68,68,0.1)' },
  };
  return map[status] || { color: '#94a3b8', background: 'rgba(148,163,184,0.1)' };
}
