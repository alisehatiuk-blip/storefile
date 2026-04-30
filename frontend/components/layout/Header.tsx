'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, ShoppingCart, User, ChevronDown, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const navigation = [
  { name: 'خانه', href: '/' },
  { name: 'محصولات', href: '/products' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس', href: '/contact' },
  { name: 'سوالات متداول', href: '/faq' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              دیجی<span className="text-indigo-400">اسکریپت</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              <Search className="w-5 h-5" />
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {user?.firstName || 'کاربر'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 glass rounded-xl py-2 shadow-xl border border-white/[0.08] animate-scale-in">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      داشبورد
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      پروفایل
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      سفارش‌ها
                    </Link>
                    <div className="border-t border-white/[0.06] my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-right px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                    >
                      خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm py-2 px-4">
                  ورود
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  ثبت‌نام
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#0f0f1a]/98 backdrop-blur-xl border-t border-white/[0.06]">
          <div className="px-4 py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  pathname === item.href
                    ? 'bg-indigo-500/10 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" className="btn-ghost text-center justify-center" onClick={() => setMobileOpen(false)}>
                  ورود
                </Link>
                <Link href="/register" className="btn-primary justify-center" onClick={() => setMobileOpen(false)}>
                  ثبت‌نام رایگان
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
