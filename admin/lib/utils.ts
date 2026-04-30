import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('fa-IR')} تومان`;
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'در انتظار', completed: 'تکمیل', cancelled: 'لغو', refunded: 'برگشت',
    open: 'باز', in_progress: 'در حال بررسی', resolved: 'حل شده', closed: 'بسته',
    active: 'فعال', expired: 'منقضی', revoked: 'ابطال',
    published: 'منتشر', draft: 'پیش‌نویس', archived: 'بایگانی',
    user: 'کاربر', admin: 'مدیر', super_admin: 'ابر مدیر',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10', completed: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10', refunded: 'text-orange-400 bg-orange-400/10',
    open: 'text-blue-400 bg-blue-400/10', in_progress: 'text-indigo-400 bg-indigo-400/10',
    resolved: 'text-green-400 bg-green-400/10', closed: 'text-slate-400 bg-slate-400/10',
    active: 'text-green-400 bg-green-400/10', expired: 'text-red-400 bg-red-400/10',
    published: 'text-green-400 bg-green-400/10', draft: 'text-yellow-400 bg-yellow-400/10',
    archived: 'text-slate-400 bg-slate-400/10', user: 'text-blue-400 bg-blue-400/10',
    admin: 'text-indigo-400 bg-indigo-400/10', super_admin: 'text-purple-400 bg-purple-400/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10';
}
