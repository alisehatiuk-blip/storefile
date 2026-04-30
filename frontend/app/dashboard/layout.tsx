'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, ShoppingBag, Download, MessageSquare, Key, User, LogOut, Code2, ChevronLeft,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'داشبورد', exact: true },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'سفارش‌ها' },
  { href: '/dashboard/downloads', icon: Download, label: 'دانلودها' },
  { href: '/dashboard/licenses', icon: Key, label: 'لایسنس‌ها' },
  { href: '/dashboard/tickets', icon: MessageSquare, label: 'پشتیبانی' },
  { href: '/dashboard/profile', icon: User, label: 'پروفایل' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a14] border-l border-white/[0.06] flex flex-col fixed inset-y-0 right-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">دیجی‌اسکریپت</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'کاربر'}
              </p>
              <p className="text-slate-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item)
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/[0.06] space-y-1">
          <Link
            href="/products"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            بازگشت به سایت
          </Link>
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 mr-64 min-h-screen bg-[#0f0f1a]">
        {children}
      </main>
    </div>
  );
}
