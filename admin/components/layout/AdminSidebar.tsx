'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag, MessageSquare,
  Settings, FileText, LogOut, Shield, Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminAuthStore } from '@/store/auth';

const navGroups = [
  {
    label: 'داشبورد',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'داشبورد', exact: true },
      { href: '/dashboard/logs', icon: Activity, label: 'لاگ‌ها' },
    ],
  },
  {
    label: 'مدیریت محتوا',
    items: [
      { href: '/dashboard/products', icon: Package, label: 'محصولات' },
      { href: '/dashboard/categories', icon: Tag, label: 'دسته‌بندی‌ها' },
    ],
  },
  {
    label: 'فروش',
    items: [
      { href: '/dashboard/orders', icon: ShoppingBag, label: 'سفارش‌ها' },
    ],
  },
  {
    label: 'کاربران',
    items: [
      { href: '/dashboard/users', icon: Users, label: 'کاربران' },
      { href: '/dashboard/tickets', icon: MessageSquare, label: 'تیکت‌ها' },
    ],
  },
  {
    label: 'سیستم',
    items: [
      { href: '/dashboard/settings', icon: Settings, label: 'تنظیمات' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAdminAuthStore();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed right-0 top-0 h-full w-[260px] bg-[#0a0a14] border-l border-white/[0.06] flex flex-col z-30">
      {/* Logo */}
      <div className="p-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">دیجی‌اسکریپت</p>
            <p className="text-slate-500 text-xs">پنل مدیریت</p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03]">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">{user?.firstName || 'مدیر'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-slate-600 text-xs font-medium uppercase tracking-wider mb-2 px-4">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'sidebar-link',
                    isActive(item.href, (item as any).exact) && 'active'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          خروج از پنل
        </button>
      </div>
    </aside>
  );
}
