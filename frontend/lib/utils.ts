import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string, currency = 'تومان'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${num.toLocaleString('fa-IR')} ${currency}`;
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const rtf = new Intl.RelativeTimeFormat('fa', { numeric: 'auto' });
  const diff = (date.getTime() - Date.now()) / 1000;

  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;
  const WEEK = 604800;
  const MONTH = 2592000;

  if (Math.abs(diff) < MINUTE) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute');
  if (Math.abs(diff) < DAY) return rtf.format(Math.round(diff / HOUR), 'hour');
  if (Math.abs(diff) < WEEK) return rtf.format(Math.round(diff / DAY), 'day');
  if (Math.abs(diff) < MONTH) return rtf.format(Math.round(diff / WEEK), 'week');
  return rtf.format(Math.round(diff / MONTH), 'month');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'در انتظار',
    completed: 'تکمیل شده',
    cancelled: 'لغو شده',
    refunded: 'برگشت داده شده',
    open: 'باز',
    in_progress: 'در حال بررسی',
    resolved: 'حل شده',
    closed: 'بسته شده',
    active: 'فعال',
    expired: 'منقضی شده',
    revoked: 'ابطال شده',
    published: 'منتشر شده',
    draft: 'پیش‌نویس',
    archived: 'بایگانی شده',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'text-yellow-400 bg-yellow-400/10',
    completed: 'text-green-400 bg-green-400/10',
    cancelled: 'text-red-400 bg-red-400/10',
    refunded: 'text-orange-400 bg-orange-400/10',
    open: 'text-blue-400 bg-blue-400/10',
    in_progress: 'text-indigo-400 bg-indigo-400/10',
    resolved: 'text-green-400 bg-green-400/10',
    closed: 'text-slate-400 bg-slate-400/10',
    active: 'text-green-400 bg-green-400/10',
    expired: 'text-red-400 bg-red-400/10',
    revoked: 'text-red-400 bg-red-400/10',
    published: 'text-green-400 bg-green-400/10',
    draft: 'text-yellow-400 bg-yellow-400/10',
    archived: 'text-slate-400 bg-slate-400/10',
  };
  return colors[status] || 'text-slate-400 bg-slate-400/10';
}
