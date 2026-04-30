'use client';

import { useState, useEffect } from 'react';
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
  const { login, isLoading, init } = useAdminAuthStore();
  const router = useRouter();

  // Hydrate on mount and redirect if already logged in
  useEffect(() => {
    init();
    const token = localStorage.getItem('admin_access_token');
    if (token) router.replace('/dashboard');
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: '#0f0f1a', position: 'relative', overflow: 'hidden' }}>
      {/* Background gradient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.18), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 300, height: 300, background: 'rgba(99,102,241,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 20px 40px rgba(79,70,229,0.35)' }}>
            <Shield style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>پنل مدیریت</h1>
          <p style={{ fontSize: '0.875rem', color: '#475569' }}>دیجی‌اسکریپت — ورود مدیران</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 6 }}>ایمیل مدیر</label>
              <input
                {...register('email')}
                type="email"
                placeholder="admin@example.com"
                className="input"
                dir="ltr"
                autoComplete="email"
                autoFocus
              />
              {errors.email && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4 }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 6 }}>رمز عبور</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  style={{ paddingLeft: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: '0.75rem', color: '#f87171', marginTop: 4 }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '0.875rem', marginTop: 8, fontSize: '0.9375rem', opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? (
                <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} /> در حال ورود...</>
              ) : (
                'ورود به پنل مدیریت'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{ marginTop: '1.5rem', padding: '0.875rem', borderRadius: 10, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
            <p style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, marginBottom: 6 }}>اطلاعات تست:</p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', direction: 'ltr', lineHeight: 1.6 }}>
              admin@digiscript.ir<br />
              Admin@123456
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
