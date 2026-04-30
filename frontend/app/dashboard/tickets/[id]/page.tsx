'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Send, MessageSquare, XCircle, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['ticket', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${params.id}`);
      return data.data;
    },
    refetchInterval: 15000,
  });

  const replyMutation = useMutation({
    mutationFn: async (msg: string) => {
      const { data } = await api.post(`/tickets/${params.id}/reply`, { message: msg });
      return data;
    },
    onSuccess: () => {
      toast.success('پیام ارسال شد');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
    },
    onError: () => toast.error('خطا در ارسال پیام'),
  });

  const closeMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`/tickets/${params.id}/close`);
    },
    onSuccess: () => {
      toast.success('تیکت بسته شد');
      queryClient.invalidateQueries({ queryKey: ['ticket', params.id] });
    },
    onError: () => toast.error('خطا در بستن تیکت'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    replyMutation.mutate(message.trim());
  };

  if (isLoading) return (
    <div className="p-8 flex justify-center"><LoadingSpinner size="lg" /></div>
  );

  if (!data) return (
    <div className="p-8 text-center" style={{ color: '#64748b' }}>تیکت یافت نشد</div>
  );

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tickets" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: '#64748b' }}>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">{data.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono" style={{ color: '#475569' }}>{data.ticketNumber}</span>
              <span className={`badge text-xs ${getStatusColor(data.status)}`}>{getStatusLabel(data.status)}</span>
            </div>
          </div>
        </div>
        {data.status !== 'closed' && (
          <button
            onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all"
            style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}
          >
            <XCircle className="w-4 h-4" />
            بستن تیکت
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="card mb-4 divide-y" style={{ divideColor: 'rgba(255,255,255,0.04)' }}>
        {(data.messages || []).length === 0 ? (
          <div className="p-8 text-center" style={{ color: '#475569' }}>
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">هنوز پیامی وجود ندارد</p>
          </div>
        ) : (
          [...(data.messages || [])].reverse().map((msg: any) => {
            const isAdmin = msg.senderRole === 'admin';
            return (
              <div key={msg.id} className="p-5">
                <div className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: isAdmin ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'linear-gradient(135deg,#0ea5e9,#6366f1)' }}
                  >
                    {isAdmin ? 'پ' : (user?.firstName?.[0] || 'ک')}
                  </div>
                  <div className={`flex-1 ${isAdmin ? '' : 'text-right'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium" style={{ color: isAdmin ? '#a5b4fc' : '#e2e8f0' }}>
                        {isAdmin ? 'پشتیبانی' : (user?.firstName || 'شما')}
                      </span>
                      <span className="text-xs" style={{ color: '#475569' }}>{formatDate(msg.createdAt)}</span>
                    </div>
                    <div
                      className="p-4 rounded-xl text-sm leading-relaxed"
                      style={{
                        background: isAdmin ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${isAdmin ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'}`,
                        color: '#e2e8f0',
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reply form */}
      {data.status !== 'closed' ? (
        <form onSubmit={handleSend} className="card p-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            rows={4}
            className="input resize-none mb-3"
          />
          <button
            type="submit"
            disabled={!message.trim() || replyMutation.isPending}
            className="btn-primary"
            style={{ opacity: (!message.trim() || replyMutation.isPending) ? 0.6 : 1 }}
          >
            {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ارسال پیام
          </button>
        </form>
      ) : (
        <div className="card p-4 text-center text-sm" style={{ color: '#475569' }}>
          این تیکت بسته شده است
        </div>
      )}
    </div>
  );
}
