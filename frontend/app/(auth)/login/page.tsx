'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Code2, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const loginSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      await login(data.email, data.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطا در ورود به سیستم');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">
            دیجی<span className="text-indigo-400">اسکریپت</span>
          </span>
        </Link>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">ورود به حساب</h1>
          <p className="text-slate-400 text-sm text-center mb-8">
            خوش برگشتید! لطفاً اطلاعات خود را وارد کنید
          </p>

          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">ایمیل</label>
              <input
                {...register('email')}
                type="email"
                placeholder="example@email.com"
                className="input"
                dir="ltr"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">رمز عبور</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="رمز عبور خود را وارد کنید"
                  className="input pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>مرا به خاطر بسپار</span>
              </label>
              <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                فراموشی رمز عبور
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 mt-2"
            >
              {isLoading ? 'در حال ورود...' : 'ورود به حساب'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            حساب کاربری ندارید؟{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-slate-500 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}
