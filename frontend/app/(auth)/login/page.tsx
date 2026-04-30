'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Code2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('با موفقیت وارد شدید');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'ایمیل یا رمز عبور اشتباه است';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.25), transparent), #0f0f1a' }}>
      <div className="relative w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all" style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)' }}>
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span></span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">ورود به حساب</h1>
          <p className="text-sm text-center mb-8" style={{ color: '#64748b' }}>خوش برگشتید! اطلاعات خود را وارد کنید</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>ایمیل</label>
              <input {...register('email')} type="email" placeholder="example@email.com" className="input" dir="ltr" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>رمز عبور</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="رمز عبور خود را وارد کنید" className="input" style={{ paddingLeft: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 left-3" style={{ color: '#64748b' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: '#64748b' }}>
                <input type="checkbox" className="rounded" />
                <span>مرا به خاطر بسپار</span>
              </label>
              <Link href="/forgot-password" style={{ color: '#818cf8' }} className="hover:underline">فراموشی رمز عبور</Link>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 text-base mt-2" style={{ opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ورود...</> : 'ورود به حساب'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#64748b' }}>
            حساب کاربری ندارید؟{' '}
            <Link href="/register" style={{ color: '#818cf8' }} className="font-medium hover:underline">ثبت‌نام کنید</Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm flex items-center justify-center gap-1 transition-colors" style={{ color: '#475569' }}>
            <ArrowLeft className="w-4 h-4" />بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
