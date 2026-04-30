'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Code2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth';

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل نامعتبر است').optional().or(z.literal('')),
  password: z
    .string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'باید حداقل یک حرف بزرگ داشته باشد')
    .regex(/[0-9]/, 'باید حداقل یک عدد داشته باشد'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمز عبور و تکرار آن باید یکسان باشند',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const perks = [
  'دسترسی به تمام محصولات',
  'دانلود امن با لینک اختصاصی',
  'پشتیبانی اختصاصی',
  'به‌روزرسانی‌های رایگان',
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
      });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'خطا در ثبت‌نام');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="absolute inset-0 hero-gradient pointer-events-none" />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - perks */}
        <div className="hidden lg:block">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              دیجی<span className="text-indigo-400">اسکریپت</span>
            </span>
          </Link>

          <h2 className="text-3xl font-bold text-white mb-4">
            به جامعه ما بپیوندید
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            بیش از ۱۲ هزار توسعه‌دهنده و کارآفرین از محصولات ما برای رشد کسب‌وکار خود استفاده می‌کنند.
          </p>

          <div className="space-y-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-slate-300">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">دیجی<span className="text-indigo-400">اسکریپت</span></span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">ایجاد حساب کاربری</h1>
          <p className="text-slate-400 text-sm mb-6">همین حالا رایگان ثبت‌نام کنید</p>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">نام</label>
                <input {...register('firstName')} placeholder="علی" className="input text-sm" />
                {errors.firstName && <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium mb-1.5 block">نام خانوادگی</label>
                <input {...register('lastName')} placeholder="محمدی" className="input text-sm" />
                {errors.lastName && <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">ایمیل</label>
              <input {...register('email')} type="email" placeholder="example@email.com" className="input" dir="ltr" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">شماره موبایل (اختیاری)</label>
              <input {...register('phone')} placeholder="09XXXXXXXXX" className="input" dir="ltr" />
              {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">رمز عبور</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="حداقل ۸ کاراکتر"
                  className="input pl-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">تکرار رمز عبور</label>
              <input
                {...register('confirmPassword')}
                type={showPassword ? 'text' : 'password'}
                placeholder="رمز عبور را تکرار کنید"
                className="input"
              />
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-50 mt-2"
            >
              {isLoading ? 'در حال ثبت‌نام...' : 'ایجاد حساب'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-5">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              وارد شوید
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
