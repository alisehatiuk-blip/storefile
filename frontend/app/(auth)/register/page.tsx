'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Code2, CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const perks = ['دسترسی به تمام محصولات', 'دانلود امن اختصاصی', 'پشتیبانی اختصاصی', 'به‌روزرسانی رایگان'];

export default function RegisterPage() {
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register: registerUser, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    const token = localStorage.getItem('access_token');
    if (token) router.replace('/dashboard');
    firstNameRef.current?.focus();
  }, []);

  const handleRegister = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const firstName = firstNameRef.current?.value?.trim() || '';
    const lastName = lastNameRef.current?.value?.trim() || '';
    const email = emailRef.current?.value?.trim() || '';
    const phone = phoneRef.current?.value?.trim() || '';
    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    if (!firstName) { setError('نام را وارد کنید'); return; }
    if (!lastName) { setError('نام خانوادگی را وارد کنید'); return; }
    if (!email || !email.includes('@')) { setError('ایمیل معتبر وارد کنید'); return; }
    if (password.length < 8) { setError('رمز عبور باید حداقل ۸ کاراکتر باشد'); return; }
    if (!/[A-Z]/.test(password)) { setError('رمز عبور باید حداقل یک حرف بزرگ داشته باشد'); return; }
    if (!/[0-9]/.test(password)) { setError('رمز عبور باید حداقل یک عدد داشته باشد'); return; }
    if (password !== confirmPassword) { setError('رمز عبور و تکرار آن یکسان نیستند'); return; }

    setError('');
    setLoading(true);

    try {
      await registerUser({ email, password, firstName, lastName, phone: phone || undefined });
      toast.success('حساب با موفقیت ایجاد شد');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.message || 'خطا در ثبت‌نام';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: '#0f0f1a' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.2), transparent)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 960, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        {/* Left */}
        <div style={{ display: 'none' }} className="lg-show">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem', textDecoration: 'none' }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 style={{ width: 20, height: 20, color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span></span>
          </Link>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', margin: '0 0 1rem' }}>به جامعه ما بپیوندید</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.8 }}>بیش از ۱۲ هزار توسعه‌دهنده و کارآفرین از محصولات ما استفاده می‌کنند.</p>
          {perks.map((p) => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.875rem' }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle style={{ width: 16, height: 16, color: '#10b981' }} />
              </div>
              <span style={{ color: '#cbd5e1' }}>{p}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="card" style={{ padding: '2rem', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '1.5rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 style={{ width: 18, height: 18, color: 'white' }} />
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span></span>
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', textAlign: 'center', margin: '0 0 6px' }}>ایجاد حساب کاربری</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', margin: '0 0 1.5rem' }}>رایگان ثبت‌نام کنید</p>

          {error && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '0.875rem' }}>
            <div>
              <label style={lbl}>نام</label>
              <input ref={firstNameRef} type="text" placeholder="علی" className="input" disabled={loading} />
            </div>
            <div>
              <label style={lbl}>نام خانوادگی</label>
              <input ref={lastNameRef} type="text" placeholder="محمدی" className="input" disabled={loading} />
            </div>
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label style={lbl}>ایمیل</label>
            <input ref={emailRef} type="email" placeholder="example@email.com" className="input" dir="ltr" disabled={loading} />
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label style={lbl}>موبایل <span style={{ color: '#475569', fontSize: '0.75rem' }}>(اختیاری)</span></label>
            <input ref={phoneRef} type="tel" placeholder="09XXXXXXXXX" className="input" dir="ltr" disabled={loading} />
          </div>

          <div style={{ marginBottom: '0.875rem' }}>
            <label style={lbl}>رمز عبور</label>
            <div style={{ position: 'relative' }}>
              <input ref={passwordRef} type={showPw ? 'text' : 'password'} placeholder="حداقل ۸ کاراکتر" className="input" style={{ paddingLeft: '2.75rem' }} disabled={loading} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>
                {showPw ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>تکرار رمز عبور</label>
            <input ref={confirmPasswordRef} type={showPw ? 'text' : 'password'} placeholder="رمز را تکرار کنید" className="input"
              onKeyDown={(e) => e.key === 'Enter' && handleRegister()} disabled={loading} />
          </div>

          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem',
              background: loading ? 'rgba(79,70,229,0.5)' : '#4f46e5',
              color: 'white', border: 'none', borderRadius: 12,
              fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'Vazirmatn, sans-serif',
            }}
          >
            {loading ? <><Loader2 style={{ width: 18, height: 18, animation: 'spin 0.8s linear infinite' }} />در حال ثبت‌نام...</> : 'ایجاد حساب'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.25rem', marginBottom: 0 }}>
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link href="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>وارد شوید</Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) { .lg-show { display: block !important; } }
      `}</style>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: '#94a3b8', marginBottom: 6 };
