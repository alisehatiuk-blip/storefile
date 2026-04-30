'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Code2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره موبایل نامعتبر است').optional().or(z.literal('')),
  password: z.string().min(8, 'حداقل ۸ کاراکتر').regex(/[A-Z]/, 'یک حرف بزرگ').regex(/[0-9]/, 'یک عدد'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'رمز عبور و تکرار آن یکسان نیستند', path: ['confirmPassword'] });

type RegisterForm = z.infer<typeof registerSchema>;

const perks = ['دسترسی به تمام محصولات', 'دانلود امن اختصاصی', 'پشتیبانی اختصاصی', 'به‌روزرسانی رایگان'];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({ email: data.email, password: data.password, firstName: data.firstName, lastName: data.lastName, phone: data.phone || undefined });
      toast.success('حساب کاربری با موفقیت ایجاد شد');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در ثبت‌نام');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.25), transparent), #0f0f1a' }}>
      <div className="relative w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side */}
        <div className="hidden lg:block">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)' }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span></span>
          </Link>
          <h2 className="text-3xl font-bold text-white mb-4">به جامعه ما بپیوندید</h2>
          <p className="mb-8 leading-relaxed" style={{ color: '#64748b' }}>بیش از ۱۲ هزار توسعه‌دهنده و کارآفرین از محصولات ما برای رشد کسب‌وکار خود استفاده می‌کنند.</p>
          <div className="space-y-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16,185,129,0.1)' }}>
                  <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
                </div>
                <span style={{ color: '#cbd5e1' }}>{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="lg:hidden mb-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)' }}>
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span></span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">ایجاد حساب کاربری</h1>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>همین حالا رایگان ثبت‌نام کنید</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>نام</label>
                <input {...register('firstName')} placeholder="علی" className="input text-sm" />
                {errors.firstName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>نام خانوادگی</label>
                <input {...register('lastName')} placeholder="محمدی" className="input text-sm" />
                {errors.lastName && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>ایمیل</label>
              <input {...register('email')} type="email" placeholder="example@email.com" className="input" dir="ltr" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>شماره موبایل <span style={{ color: '#475569' }}>(اختیاری)</span></label>
              <input {...register('phone')} placeholder="09XXXXXXXXX" className="input" dir="ltr" />
              {errors.phone && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>رمز عبور</label>
              <div className="relative">
                <input {...register('password')} type={showPassword ? 'text' : 'password'} placeholder="حداقل ۸ کاراکتر" className="input" style={{ paddingLeft: '2.5rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 -translate-y-1/2 left-3" style={{ color: '#64748b' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>تکرار رمز عبور</label>
              <input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="رمز عبور را تکرار کنید" className="input" />
              {errors.confirmPassword && <p className="text-xs mt-1" style={{ color: '#f87171' }}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3.5 mt-2" style={{ opacity: isLoading ? 0.6 : 1 }}>
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت‌نام...</> : 'ایجاد حساب'}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: '#64748b' }}>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" style={{ color: '#818cf8' }} className="font-medium hover:underline">وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
