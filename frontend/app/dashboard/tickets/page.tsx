'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MessageSquare, Plus, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { Ticket } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const priorityColors: Record<string, string> = {
  low: 'text-slate-400 bg-slate-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  urgent: 'text-red-400 bg-red-400/10',
};

const priorityLabels: Record<string, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
  urgent: 'فوری',
};

export default function TicketsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['user-tickets'],
    queryFn: async () => {
      const { data } = await api.get('/tickets/my');
      return data.data as Ticket[];
    },
  });

  const tickets = data || [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">تیکت‌های پشتیبانی</h1>
          <p className="text-slate-400">ارتباط با تیم پشتیبانی</p>
        </div>
        <Link href="/dashboard/tickets/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          تیکت جدید
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <div className="card text-center py-20">
          <MessageSquare className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">تیکتی وجود ندارد</h3>
          <p className="text-slate-400 mb-6">برای ارتباط با پشتیبانی، یک تیکت جدید ایجاد کنید</p>
          <Link href="/dashboard/tickets/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            ایجاد تیکت
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/tickets/${ticket.id}`}>
              <div className="card p-5 hover:border-indigo-500/20 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium truncate group-hover:text-indigo-300 transition-colors">
                        {ticket.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{ticket.ticketNumber}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500 text-xs">{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge text-xs ${priorityColors[ticket.priority]}`}>
                      {priorityLabels[ticket.priority]}
                    </span>
                    <span className={`badge text-xs ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                    <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
