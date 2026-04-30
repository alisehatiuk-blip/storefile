'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAdminAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type Form = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAdminAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'خطا در ورود');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0f0f1a]">
      <div
        className="absolute inset-0 opacity-30"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.3), transparent)' }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">پنل مدیریت</h1>
          <p className="text-slate-400 text-sm mt-1">دیجی‌اسکریپت</p>
        </div>

        <div className="card p-8">
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">ایمیل مدیر</label>
              <input {...register('email')} type="email" placeholder="admin@example.com" className="input" dir="ltr" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">رمز عبور</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="input pl-10" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 disabled:opacity-50">
              {isLoading ? 'در حال ورود...' : 'ورود به پنل'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
