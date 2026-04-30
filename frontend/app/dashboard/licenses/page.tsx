'use client';

import { useQuery } from '@tanstack/react-query';
import { Key, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { License } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LicensesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['user-licenses'],
    queryFn: async () => {
      const { data } = await api.get('/licenses/my');
      return data.data as License[];
    },
  });

  const licenses = data || [];

  const handleCopy = (licenseKey: string, id: string) => {
    navigator.clipboard.writeText(licenseKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">لایسنس‌ها</h1>
        <p className="text-slate-400">کلیدهای لایسنس محصولات خریداری شده</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : licenses.length === 0 ? (
        <div className="card text-center py-20">
          <Key className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-white text-xl font-semibold mb-2">لایسنسی موجود نیست</h3>
          <p className="text-slate-400">پس از خرید محصول، لایسنس آن اینجا نمایش داده می‌شود</p>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => (
            <div key={license.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">محصول #{license.productId.slice(0, 8)}</p>
                    <p className="text-slate-500 text-xs">فعال شده: {formatDate(license.activatedAt || license.createdAt)}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(license.status)}`}>
                  {getStatusLabel(license.status)}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 rounded-xl p-3 border border-white/5">
                <code className="flex-1 text-emerald-400 font-mono text-sm tracking-wider" dir="ltr">
                  {license.licenseKey}
                </code>
                <button
                  onClick={() => handleCopy(license.licenseKey, license.id)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="کپی کلید"
                >
                  {copiedId === license.id ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {license.expiresAt && (
                <p className="text-slate-500 text-xs mt-2">
                  انقضا: {formatDate(license.expiresAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
