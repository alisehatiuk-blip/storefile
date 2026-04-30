'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, ExternalLink, Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAdminAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const pageTitles: Record<string, string> = {
  '/dashboard': 'داشبورد',
  '/dashboard/products': 'محصولات',
  '/dashboard/products/new': 'محصول جدید',
  '/dashboard/categories': 'دسته‌بندی‌ها',
  '/dashboard/orders': 'سفارش‌ها',
  '/dashboard/users': 'کاربران',
  '/dashboard/tickets': 'تیکت‌ها',
  '/dashboard/settings': 'تنظیمات',
  '/dashboard/logs': 'لاگ‌ها',
};

interface Props {
  onMenuToggle: () => void;
}

export default function AdminTopbar({ onMenuToggle }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const title = Object.entries(pageTitles).reverse().find(([key]) => pathname.startsWith(key))?.[1] || 'پنل مدیریت';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('با موفقیت خارج شدید');
    router.push('/login');
  };

  return (
    <header
      className="h-16 flex items-center justify-between px-5 sticky top-0 z-20"
      style={{ background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg transition-all hover:bg-white/10"
          style={{ color: '#94a3b8' }}
          title="باز/بستن منو"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:bg-white/10"
          style={{ color: '#64748b' }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          مشاهده سایت
        </a>

        <button className="relative p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: '#64748b' }}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
        </button>

        {/* User menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white leading-none">{user?.firstName || 'مدیر'}</p>
              <p className="text-xs leading-none mt-0.5" style={{ color: '#475569' }}>
                {user?.role === 'super_admin' ? 'ابر مدیر' : 'مدیر'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5" style={{ color: '#475569' }} />
          </button>

          {userMenuOpen && (
            <div
              className="absolute left-0 top-full mt-2 w-52 rounded-xl py-2 shadow-2xl"
              style={{ background: '#12121f', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="px-4 py-2.5 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-semibold text-white">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'مدیر'}</p>
                <p className="text-xs" style={{ color: '#64748b' }}>{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-all hover:bg-red-500/5"
                style={{ color: '#f87171' }}
              >
                <LogOut className="w-4 h-4 opacity-60" />
                خروج از پنل
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
