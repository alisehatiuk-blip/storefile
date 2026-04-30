'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Search, User, ChevronDown, Code2, LogOut, LayoutDashboard, ShoppingBag, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const megaMenuCategories = [
  {
    name: 'اسکریپت‌ها',
    slug: 'scripts',
    description: 'اسکریپت‌های آماده پایتون، Node.js و بیشتر',
    icon: '⚡',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&q=80',
    count: '۱۲۰+',
    color: '#6366f1',
  },
  {
    name: 'میکرو SaaS',
    slug: 'micro-saas',
    description: 'ابزارهای SaaS آماده برای استقرار فوری',
    icon: '🚀',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80',
    count: '۸۵+',
    color: '#0ea5e9',
  },
  {
    name: 'اتوماسیون',
    slug: 'automation',
    description: 'ابزارهای اتوماسیون کسب‌وکار',
    icon: '🤖',
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80',
    count: '۶۴+',
    color: '#f59e0b',
  },
  {
    name: 'کسب‌وکار',
    slug: 'business-solutions',
    description: 'راهکارهای جامع کسب‌وکار',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80',
    count: '۵۲+',
    color: '#10b981',
  },
  {
    name: 'توسعه وب',
    slug: 'web-development',
    description: 'قالب‌ها، کامپوننت‌ها و ابزارهای وب',
    icon: '🌐',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=300&q=80',
    count: '۹۸+',
    color: '#8b5cf6',
  },
];

const navLinks = [
  { name: 'خانه', href: '/' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس', href: '/contact' },
  { name: 'سوالات متداول', href: '/faq' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hoveredCat, setHoveredCat] = useState(megaMenuCategories[0]);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const megaRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    toast.success('با موفقیت خارج شدید');
    router.push('/');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        isScrolled
          ? 'shadow-xl shadow-black/30'
          : ''
      )}
      style={{
        background: isScrolled
          ? 'rgba(10, 10, 20, 0.96)'
          : 'rgba(15, 15, 26, 0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isScrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:scale-110" style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              دیجی<span style={{ color: '#818cf8' }}>اسکریپت</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'text-indigo-400'
                    : 'hover:text-white'
                )}
                style={{ color: pathname === item.href ? '#818cf8' : '#94a3b8' }}
              >
                {item.name}
              </Link>
            ))}

            {/* Mega menu trigger */}
            <div ref={megaRef} className="relative">
              <button
                onClick={() => setMegaOpen(!megaOpen)}
                className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: megaOpen ? '#818cf8' : '#94a3b8' }}
              >
                محصولات
                <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', megaOpen && 'rotate-180')} />
              </button>

              {/* Mega Menu Panel */}
              {megaOpen && (
                <div
                  className="absolute top-full mt-3 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    right: '-200px',
                    width: '680px',
                    background: '#12121f',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="flex">
                    {/* Categories list */}
                    <div className="w-56 border-l border-white/[0.05] p-3">
                      <p className="text-xs font-semibold uppercase tracking-wider px-3 py-2" style={{ color: '#475569' }}>دسته‌بندی‌ها</p>
                      {megaMenuCategories.map((cat) => (
                        <button
                          key={cat.slug}
                          onMouseEnter={() => setHoveredCat(cat)}
                          onClick={() => { router.push(`/categories/${cat.slug}`); setMegaOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-right"
                          style={{
                            background: hoveredCat.slug === cat.slug ? 'rgba(99,102,241,0.1)' : 'transparent',
                            color: hoveredCat.slug === cat.slug ? '#a5b4fc' : '#94a3b8',
                          }}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <div className="text-right">
                            <p className="text-sm font-medium">{cat.name}</p>
                            <p className="text-xs" style={{ color: '#475569' }}>{cat.count} محصول</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Preview panel */}
                    <div className="flex-1 p-5">
                      <div
                        className="relative h-40 rounded-xl overflow-hidden mb-4"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                      >
                        <img
                          src={hoveredCat.image}
                          alt={hoveredCat.name}
                          className="w-full h-full object-cover opacity-60 transition-all duration-300"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ background: `linear-gradient(to bottom, transparent, ${hoveredCat.color}40)` }}
                        />
                        <div className="absolute bottom-3 right-3">
                          <span className="text-3xl">{hoveredCat.icon}</span>
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">{hoveredCat.name}</h3>
                      <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>{hoveredCat.description}</p>
                      <Link
                        href={`/categories/${hoveredCat.slug}`}
                        onClick={() => setMegaOpen(false)}
                        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
                        style={{ background: hoveredCat.color + '20', color: hoveredCat.color, border: `1px solid ${hoveredCat.color}40` }}
                      >
                        مشاهده همه {hoveredCat.count} محصول ←
                      </Link>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
                    <Link href="/products" onClick={() => setMegaOpen(false)} className="text-sm flex items-center justify-center gap-1 font-medium transition-colors" style={{ color: '#6366f1' }}>
                      مشاهده تمام محصولات →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href="/search" className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10" style={{ color: '#94a3b8' }}>
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: '#4f46e5' }}>
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user?.firstName || 'کاربر'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-52 rounded-xl py-2 shadow-2xl" style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="px-4 py-2.5 border-b mb-1" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <p className="text-sm font-semibold text-white">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'کاربر'}</p>
                      <p className="text-xs" style={{ color: '#64748b' }}>{user?.email}</p>
                    </div>
                    {[
                      { href: '/dashboard', icon: LayoutDashboard, label: 'داشبورد' },
                      { href: '/dashboard/orders', icon: ShoppingBag, label: 'سفارش‌ها' },
                      { href: '/dashboard/licenses', icon: Key, label: 'لایسنس‌ها' },
                      { href: '/dashboard/profile', icon: User, label: 'پروفایل' },
                    ].map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all hover:bg-white/5"
                        style={{ color: '#cbd5e1' }}>
                        <item.icon className="w-4 h-4 opacity-60" />
                        {item.label}
                      </Link>
                    ))}
                    <div className="border-t my-1" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-all hover:bg-red-500/5" style={{ color: '#f87171' }}>
                      <LogOut className="w-4 h-4 opacity-60" />
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm py-2 px-4">ورود</Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">ثبت‌نام</Link>
              </div>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg" style={{ color: '#94a3b8' }}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background: 'rgba(10,10,20,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{ color: pathname === item.href ? '#818cf8' : '#94a3b8', background: pathname === item.href ? 'rgba(99,102,241,0.1)' : 'transparent' }}>
                {item.name}
              </Link>
            ))}
            <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold uppercase px-4 mb-2" style={{ color: '#475569' }}>دسته‌بندی‌ها</p>
              {megaMenuCategories.map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all"
                  style={{ color: '#94a3b8' }}>
                  <span>{cat.icon}</span>{cat.name}
                </Link>
              ))}
            </div>
            {!isAuthenticated && (
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/login" className="btn-ghost text-center justify-center" onClick={() => setMobileOpen(false)}>ورود</Link>
                <Link href="/register" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>ثبت‌نام رایگان</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
