'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Download, MessageSquare,
  Key, User, LogOut, Code2, ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'داشبورد', exact: true },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'سفارش‌ها' },
  { href: '/dashboard/downloads', icon: Download, label: 'دانلودها' },
  { href: '/dashboard/licenses', icon: Key, label: 'لایسنس‌ها' },
  { href: '/dashboard/tickets', icon: MessageSquare, label: 'پشتیبانی' },
  { href: '/dashboard/profile', icon: User, label: 'پروفایل' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout, init } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    init();
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f1a' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const handleLogout = async () => {
    await logout();
    toast.success('با موفقیت خارج شدید');
    router.push('/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0f1a' }}>
      {/* Sidebar */}
      <aside
        className="w-64 flex flex-col fixed inset-y-0 right-0 z-30"
        style={{ background: '#0a0a14', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#0ea5e9)' }}>
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">دیجی‌اسکریپت</span>
          </Link>
        </div>

        {/* User */}
        <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'کاربر'}
              </p>
              <p className="text-xs truncate" style={{ color: '#475569' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                  color: active ? '#a5b4fc' : '#94a3b8',
                  border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5"
            style={{ color: '#64748b' }}
          >
            <ChevronLeft className="w-4 h-4" />
            بازگشت به سایت
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-red-500/5"
            style={{ color: '#f87171' }}
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" style={{ marginRight: '256px' }}>
        {children}
      </main>
    </div>
  );
}
