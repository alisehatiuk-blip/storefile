'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Shield, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: '20', ...(search && { search }) });
      const { data } = await api.get(`/users?${params}`);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{pagination?.total || 0} کاربر</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="جستجو در کاربران..."
            className="input pr-9"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">کاربری یافت نشد</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right p-4 text-slate-400 text-xs font-medium">کاربر</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">نقش</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden lg:table-cell">ایمیل تایید</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden lg:table-cell">عضویت</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium">وضعیت</th>
                <th className="p-4 text-slate-400 text-xs font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user.firstName?.[0] || user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {user.firstName ? `${user.firstName} ${user.lastName || ''}` : '—'}
                        </p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={`badge text-xs ${getStatusColor(user.role)}`}>{getStatusLabel(user.role)}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {user.isEmailVerified ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Shield className="w-4 h-4 text-slate-600" />
                    )}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-slate-400 text-xs">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`badge text-xs ${user.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {user.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } })}
                      className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                        user.isActive
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                    >
                      {user.isActive ? 'غیرفعال' : 'فعال'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-40">قبلی</button>
          <span className="text-slate-400 text-sm">{page} از {pagination.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="btn-secondary disabled:opacity-40">بعدی</button>
        </div>
      )}
    </div>
  );
}
