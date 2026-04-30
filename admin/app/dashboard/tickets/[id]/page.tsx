'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, Send, Loader2, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-ticket', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${params.id}`);
      return data.data;
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (msg: string) => {
      await api.post(`/tickets/${params.id}/reply`, { message: msg });
    },
    onSuccess: () => {
      toast.success('پاسخ ارسال شد');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', params.id] });
    },
    onError: () => toast.error('خطا در ارسال پاسخ'),
  });

  const closeMutation = useMutation({
    mutationFn: async () => { await api.patch(`/tickets/${params.id}/close`); },
    onSuccess: () => {
      toast.success('تیکت بسته شد');
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', params.id] });
    },
    onError: () => toast.error('خطا'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    replyMutation.mutate(message.trim());
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} /></div>;
  if (!data) return <div className="text-center py-20" style={{ color: '#64748b' }}>تیکت یافت نشد</div>;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tickets" className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: '#64748b' }}>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white">{data.subject}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono" style={{ color: '#475569' }}>{data.ticketNumber}</span>
              <span className={`badge text-xs ${getStatusColor(data.status)}`}>{getStatusLabel(data.status)}</span>
            </div>
          </div>
        </div>
        {data.status !== 'closed' && (
          <button onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending} className="btn-secondary text-sm">
            <CheckCircle className="w-4 h-4" />
            بستن تیکت
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="card">
        <div className="divide-y" >
          {[...(data.messages || [])].reverse().map((msg: any) => {
            const isAdminMsg = msg.senderRole === 'admin';
            return (
              <div key={msg.id} className="p-5">
                <div className={`flex gap-3 ${isAdminMsg ? 'flex-row-reverse' : ''}`}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: isAdminMsg ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.1)' }}>
                    {isAdminMsg ? 'م' : 'ک'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium" style={{ color: isAdminMsg ? '#a5b4fc' : '#e2e8f0' }}>
                        {isAdminMsg ? 'مدیر' : 'کاربر'}
                      </span>
                      <span className="text-xs" style={{ color: '#475569' }}>{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="p-4 rounded-xl text-sm leading-relaxed"
                      style={{ background: isAdminMsg ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isAdminMsg ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'}`, color: '#e2e8f0' }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.status !== 'closed' ? (
        <form onSubmit={handleSend} className="card p-4">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="پاسخ خود را بنویسید..." rows={4} className="input resize-none mb-3" />
          <button type="submit" disabled={!message.trim() || replyMutation.isPending} className="btn-primary" style={{ opacity: (!message.trim() || replyMutation.isPending) ? 0.6 : 1 }}>
            {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            ارسال پاسخ
          </button>
        </form>
      ) : (
        <div className="card p-4 text-center text-sm" style={{ color: '#475569' }}>این تیکت بسته شده است</div>
      )}
    </div>
  );
}
