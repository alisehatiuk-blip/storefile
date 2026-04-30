'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import api from '@/lib/api';

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: typeof form) => api.post('/categories', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowForm(false);
      setForm({ name: '', slug: '', description: '', isActive: true });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-categories'] }),
  });

  const categories = data || [];

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{categories.length} دسته‌بندی</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-white font-semibold mb-4">دسته‌بندی جدید</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">نام</label>
              <input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
                placeholder="مثلاً: اسکریپت‌ها"
                className="input"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm mb-1.5 block">اسلاگ</label>
              <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="text-slate-300 text-sm mb-1.5 block">توضیحات</label>
              <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending} className="btn-primary">
              ذخیره
            </button>
            <button onClick={() => { setShowForm(false); setForm({ name: '', slug: '', description: '', isActive: true }); }} className="btn-secondary">
              انصراف
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-slate-500">در حال بارگذاری...</div>
        ) : categories.length === 0 ? (
          <div className="p-10 text-center">
            <Tag className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">دسته‌بندی‌ای موجود نیست</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right p-4 text-slate-400 text-xs font-medium">نام</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">اسلاگ</th>
                <th className="text-right p-4 text-slate-400 text-xs font-medium hidden md:table-cell">وضعیت</th>
                <th className="p-4 text-slate-400 text-xs font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {categories.map((cat: any) => (
                <tr key={cat.id} className="hover:bg-white/[0.02]">
                  {editItem?.id === cat.id ? (
                    <td colSpan={4} className="p-4">
                      <div className="flex gap-3">
                        <input
                          value={editItem.name}
                          onChange={(e) => setEditItem((p: any) => ({ ...p, name: e.target.value }))}
                          className="input flex-1"
                        />
                        <button onClick={() => updateMutation.mutate({ id: cat.id, data: editItem })} className="btn-primary">ذخیره</button>
                        <button onClick={() => setEditItem(null)} className="btn-secondary">انصراف</button>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="p-4">
                        <p className="text-white text-sm font-medium">{cat.name}</p>
                        {cat.description && <p className="text-slate-500 text-xs">{cat.description}</p>}
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <code className="text-slate-400 text-xs">{cat.slug}</code>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className={`badge text-xs ${cat.isActive ? 'text-green-400 bg-green-400/10' : 'text-slate-400 bg-slate-400/10'}`}>
                          {cat.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditItem(cat)} className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteMutation.mutate(cat.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
