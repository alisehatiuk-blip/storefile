'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react';
import { useAdminAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, init } = useAdminAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
    if (token) router.replace('/dashboard');
    // Focus email input
    emailRef.current?.focus();
  }, []);

  const handleLogin = async (e: React.MouseEvent | React.FormEvent) => {
    // Always prevent default browser behavior
    e.preventDefault();
    e.stopPropagation();

    const email = emailRef.current?.value?.trim() || '';
    const password = passwordRef.current?.value || '';

    if (!email) { setError('ایمیل را وارد کنید'); emailRef.current?.focus(); return; }
    if (!password) { setError('رمز عبور را وارد کنید'); passwordRef.current?.focus(); return; }

    setError('');
    setLoading(true);

    try {
      await login(email, password);
      toast.success('ورود موفق — خوش آمدید');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'ایمیل یا رمز عبور اشتباه است';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin(e as any);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', background: '#0f0f1a', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.18), transparent)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', right: '15%', width: 300, height: 300, background: 'rgba(99,102,241,0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 20px 40px rgba(79,70,229,0.35)',
          }}>
            <Shield style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', margin: '0 0 4px' }}>پنل مدیریت</h1>
          <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>دیجی‌اسکریپت — ورود مدیران</p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          {error && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171', fontSize: '0.875rem', textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 8 }}>
              ایمیل مدیر
            </label>
            <input
              ref={emailRef}
              type="email"
              placeholder="admin@digiscript.ir"
              className="input"
              dir="ltr"
              autoComplete="email"
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1', marginBottom: 8 }}>
              رمز عبور
            </label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: '2.75rem' }}
                autoComplete="current-password"
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', left: '0.875rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#64748b', padding: 0,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Submit button — NOT inside a form tag, click handler only */}
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
            {loading ? (
              <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} />در حال ورود...</>
            ) : (
              'ورود به پنل مدیریت'
            )}
          </button>

          {/* Demo credentials */}
          <div style={{
            marginTop: '1.5rem', padding: '0.875rem', borderRadius: 10,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
          }}>
            <p style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, margin: '0 0 6px' }}>اطلاعات تست:</p>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', fontFamily: 'monospace', direction: 'ltr', margin: 0, lineHeight: 1.8 }}>
              admin@digiscript.ir<br />Admin@123456
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
