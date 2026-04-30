'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Info, XCircle } from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

const severityConfig: Record<string, { icon: any; color: string }> = {
  info: { icon: Info, color: 'text-blue-400 bg-blue-400/10' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400 bg-yellow-400/10' },
  error: { icon: XCircle, color: 'text-red-400 bg-red-400/10' },
  critical: { icon: XCircle, color: 'text-red-500 bg-red-500/10' },
};

export default function LogsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', page],
    queryFn: async () => {
      const { data } = await api.get(`/admin/logs?page=${page}&limit=50`);
      return data.data;
    },
    refetchInterval: 10000,
  });

  const logs = data?.logs || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">لاگ‌های سیستم (تازه‌سازی هر ۱۰ ثانیه)</p>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">لاگی موجود نیست</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {logs.map((log: any) => {
              const config = severityConfig[log.severity] || severityConfig.info;
              return (
                <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                    <config.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white text-sm font-medium">{log.action}</span>
                      {log.resource && (
                        <span className="text-slate-500 text-xs">{log.resource}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-slate-400 text-xs truncate">{log.details}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-500 text-xs">{log.ipAddress || '—'}</p>
                    <p className="text-slate-600 text-xs">{formatDate(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">صفحه قبل</button>
        <span className="text-slate-400 text-sm">صفحه {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50} className="btn-secondary disabled:opacity-40">صفحه بعد</button>
      </div>
    </div>
  );
}
