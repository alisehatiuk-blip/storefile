'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  orders: any[];
}

const DAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export default function RevenueChart({ orders }: Props) {
  // Generate last 7 days data
  const data = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayOrders = orders.filter(o => {
      const od = new Date(o.createdAt);
      return od.toDateString() === date.toDateString();
    });
    const revenue = dayOrders.reduce((sum, o) => sum + parseFloat(o.totalAmount || 0), 0);
    return {
      day: DAYS[date.getDay()],
      revenue,
      orders: dayOrders.length,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontFamily: 'Vazirmatn, sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 6px' }}>{label}</p>
          <p style={{ color: '#a5b4fc', fontWeight: 700, margin: '0 0 2px', fontSize: '0.9375rem' }}>{payload[0]?.value?.toLocaleString('fa-IR')} تومان</p>
          <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{payload[1]?.value || 0} سفارش</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12, fontFamily: 'Vazirmatn, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }} />
        <Area type="monotone" dataKey="orders" stroke="#0ea5e9" strokeWidth={1.5} fill="none" strokeDasharray="4 2" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
