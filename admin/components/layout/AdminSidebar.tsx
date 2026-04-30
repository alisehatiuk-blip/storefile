'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, Users, ShoppingBag, MessageSquare,
  Settings, Activity, ChevronRight, Shield, X,
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
    label: 'محتوا',
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed top-0 h-full z-30 flex flex-col transition-all duration-300"
        style={{
          right: 0,
          width: isOpen ? '260px' : '0px',
          background: '#0a0a14',
          borderLeft: isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', minWidth: '260px' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">دیجی‌اسکریپت</p>
              <p className="text-xs" style={{ color: '#475569' }}>پنل مدیریت</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all lg:hidden hover:bg-white/5" style={{ color: '#64748b' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6" style={{ minWidth: '260px' }}>
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-wider px-4 mb-2" style={{ color: '#334155' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, (item as any).exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                      className="sidebar-link"
                      style={{
                        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: active ? '#a5b4fc' : '#94a3b8',
                        borderColor: active ? 'rgba(99,102,241,0.2)' : 'transparent',
                      }}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
