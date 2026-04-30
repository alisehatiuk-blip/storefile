'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Send, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewTicketPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    subject: '',
    message: '',
    priority: 'medium' as const,
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: res } = await api.post('/tickets', data);
      return res;
    },
    onSuccess: (data) => {
      router.push(`/dashboard/tickets/${data.data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard/tickets" className="text-slate-400 hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">تیکت جدید</h1>
          <p className="text-slate-400">ارسال درخواست پشتیبانی</p>
        </div>
      </div>

      <div className="card p-6">
        {mutation.isError && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            خطا در ارسال تیکت. لطفاً دوباره امتحان کنید.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">موضوع</label>
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="موضوع مشکل یا سوال خود را بنویسید"
              required
              minLength={5}
              className="input"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">اولویت</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              className="input"
            >
              <option value="low">کم</option>
              <option value="medium">متوسط</option>
              <option value="high">زیاد</option>
              <option value="urgent">فوری</option>
            </select>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">توضیحات</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="مشکل یا سوال خود را به طور کامل شرح دهید..."
              required
              minLength={10}
              rows={8}
              className="input resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {mutation.isPending ? 'در حال ارسال...' : 'ارسال تیکت'}
          </button>
        </form>
      </div>
    </div>
  );
}
