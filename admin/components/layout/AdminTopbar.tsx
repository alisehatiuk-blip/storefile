'use client';

import { usePathname } from 'next/navigation';
import { Bell, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/dashboard': 'داشبورد',
  '/dashboard/products': 'محصولات',
  '/dashboard/categories': 'دسته‌بندی‌ها',
  '/dashboard/orders': 'سفارش‌ها',
  '/dashboard/users': 'کاربران',
  '/dashboard/tickets': 'تیکت‌ها',
  '/dashboard/settings': 'تنظیمات',
  '/dashboard/logs': 'لاگ‌ها',
};

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'پنل مدیریت';

  return (
    <header className="h-16 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-white font-semibold text-lg">{title}</h1>
      <div className="flex items-center gap-2">
        <Link
          href="http://localhost:3000"
          target="_blank"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          مشاهده سایت
        </Link>
        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}
