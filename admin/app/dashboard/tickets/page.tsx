'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

const priorityColors: Record<string, string> = {
  low: 'text-slate-400 bg-slate-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  urgent: 'text-red-400 bg-red-400/10',
};

const priorityLabels: Record<string, string> = {
  low: 'کم', medium: 'متوسط', high: 'زیاد', urgent: 'فوری',
};

export default function AdminTicketsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(status && { status }) });
      const { data } = await api.get(`/tickets?${params}`);
      return data;
    },
  });

  const tickets = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{pagination?.total || 0} تیکت</p>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-44">
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="in_progress">در حال بررسی</option>
          <option value="resolved">حل شده</option>
          <option value="closed">بسته</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
        ) : tickets.length === 0 ? (
          <div className="p-10 text-center">
            <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">تیکتی یافت نشد</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right p-4 text-slate-400 text-xs font-medium">موضوع</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">تاریخ</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">اولویت</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">وضعیت</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {tickets.map((ticket: any) => (
                <tr key={ticket.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="text-white text-sm font-medium">{ticket.subject}</p>
                    <p className="text-slate-500 text-xs font-mono">{ticket.ticketNumber}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{formatDate(ticket.createdAt)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`badge text-xs ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/tickets/${ticket.id}`} className="p-1.5 text-slate-400 hover:text-white transition-colors inline-block">
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
