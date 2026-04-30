'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Code2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    const token = localStorage.getItem('access_token');
    if (token) router.replace('/dashboard');
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const email = emailRef.current?.value?.trim() || '';
    const password = passwordRef.current?.value || '';

    if (!email) { setError('ایمیل را وارد کنید'); return; }
    if (!password) { setError('رمز عبور را وارد کنید'); return; }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('با موفقیت وارد شدید');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'ایمیل یا رمز عبور اشتباه است';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: '#0f0f1a',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.2), transparent)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2rem', textDecoration: 'none' }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(99,102,241,0.3)' }}>
            <Code2 style={{ width: 20, height: 20, color: 'white' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
            دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span>
          </span>
        </Link>

        <div className="card" style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 6px' }}>ورود به حساب</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', textAlign: 'center', margin: '0 0 1.75rem' }}>اطلاعات خود را وارد کنید</p>

          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 8 }}>ایمیل</label>
            <input
              ref={emailRef}
              type="email"
              placeholder="example@email.com"
              className="input"
              dir="ltr"
              autoComplete="email"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 8 }}>رمز عبور</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                placeholder="رمز عبور"
                className="input"
                style={{ paddingLeft: '2.75rem' }}
                autoComplete="current-password"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <Link href="/forgot-password" style={{ fontSize: '0.8125rem', color: '#6366f1', textDecoration: 'none' }}>فراموشی رمز عبور؟</Link>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              background: loading ? 'rgba(79,70,229,0.5)' : '#4f46e5',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Vazirmatn, sans-serif', transition: 'background 0.2s',
            }}
          >
            {loading ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} />در حال ورود...</> : 'ورود به حساب'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.25rem', marginBottom: 0 }}>
            حساب ندارید؟{' '}
            <Link href="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>ثبت‌نام کنید</Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <Link href="/" style={{ fontSize: '0.875rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />بازگشت به سایت
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
