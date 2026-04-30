'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type Form = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAdminAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    try {
      await login(data.email, data.password);
      toast.success('ورود موفق — خوش آمدید');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'ایمیل یا رمز عبور اشتباه است';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0f0f1a' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.2), transparent)' }}
      />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 20px 40px rgba(79,70,229,0.4)' }}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">پنل مدیریت</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>دیجی‌اسکریپت — فقط مدیران</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>ایمیل مدیر</label>
              <input {...register('email')} type="email" placeholder="admin@example.com" className="input" dir="ltr" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>رمز عبور</label>
              <div className="relative">
                <input {...register('password')} type={showPw ? 'text' : 'password'} className="input" style={{ paddingLeft: '2.5rem' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute top-1/2 -translate-y-1/2 left-3" style={{ color: '#64748b' }}>
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3 mt-2" style={{ opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ورود...</> : 'ورود به پنل'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: '#334155' }}>
          admin@digiscript.ir — Admin@123456
        </p>
      </div>
    </div>
  );
}
