'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Tag, X, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
}

const emptyForm = { name: '', slug: '', description: '', isActive: true, sortOrder: 0, metaTitle: '', metaDescription: '' };

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data as Category[]; },
  });

  const createMutation = useMutation({
    mutationFn: async (d: typeof form) => api.post('/categories', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی با موفقیت ایجاد شد');
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا در ایجاد دسته‌بندی'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی با موفقیت به‌روزرسانی شد');
      setEditId(null);
      setForm(emptyForm);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا در به‌روزرسانی'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی حذف شد');
    },
    onError: () => toast.error('خطا در حذف دسته‌بندی'),
  });

  const categories = data || [];

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-');

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive, sortOrder: cat.sortOrder, metaTitle: cat.metaTitle || '', metaDescription: cat.metaDescription || '' });
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('نام و اسلاگ الزامی هستند'); return; }
    if (editId) updateMutation.mutate({ id: editId, data: form });
    else createMutation.mutate(form);
  };

  const handleDelete = (cat: Category) => {
    if (confirm(`آیا مطمئن هستید که می‌خواهید "${cat.name}" را حذف کنید؟`)) {
      deleteMutation.mutate(cat.id);
    }
  };

  const FormPanel = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="card p-6 animate-[scaleIn_0.2s_ease-out]">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold">{isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</h3>
        <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} style={{ color: '#64748b' }}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>نام دسته‌بندی *</label>
          <input
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value, slug: isEdit ? f.slug : generateSlug(e.target.value) }))}
            placeholder="مثلاً: اسکریپت‌ها"
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>اسلاگ (URL) *</label>
          <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" placeholder="scripts" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>توضیحات</label>
          <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} className="input" placeholder="توضیح کوتاه درباره دسته‌بندی..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>ترتیب نمایش</label>
          <input type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} className="input" dir="ltr" />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} className="sr-only peer" />
            <div className="w-11 h-6 rounded-full peer transition-colors" style={{ background: form.isActive ? '#4f46e5' : 'rgba(255,255,255,0.1)' }}>
              <div className="w-5 h-5 rounded-full bg-white shadow transition-transform m-0.5" style={{ transform: form.isActive ? 'translateX(-20px)' : 'translateX(0)' }} />
            </div>
          </label>
          <span className="text-sm" style={{ color: '#94a3b8' }}>فعال</span>
        </div>
      </div>

      {/* SEO */}
      <div className="pt-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>SEO</p>
        <input value={form.metaTitle} onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" placeholder="عنوان SEO..." />
        <input value={form.metaDescription} onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} className="input" placeholder="توضیحات SEO..." />
      </div>

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending || updateMutation.isPending}
          className="btn-primary"
          style={{ opacity: (createMutation.isPending || updateMutation.isPending) ? 0.6 : 1 }}
        >
          {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
        </button>
        <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="btn-secondary">انصراف</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: '#64748b' }}>{categories.length} دسته‌بندی</p>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          دسته‌بندی جدید
        </button>
      </div>

      {/* Add form */}
      {showForm && <FormPanel />}

      {/* Edit form */}
      {editId && <FormPanel isEdit />}

      {/* List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6366f1' }} /></div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: '#64748b' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>هنوز دسته‌بندی‌ای ایجاد نشده</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>نام</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: '#475569' }}>اسلاگ</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: '#475569' }}>ترتیب</th>
                <th className="text-right p-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>وضعیت</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Tag className="w-4 h-4" style={{ color: '#6366f1' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{cat.name}</p>
                        {cat.description && <p className="text-xs truncate max-w-xs" style={{ color: '#64748b' }}>{cat.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <code className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8' }}>{cat.slug}</code>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-sm" style={{ color: '#64748b' }}>{cat.sortOrder}</span>
                  </td>
                  <td className="p-4">
                    <span className="badge text-xs" style={{ background: cat.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', color: cat.isActive ? '#10b981' : '#64748b' }}>
                      {cat.isActive ? 'فعال' : 'غیرفعال'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg transition-all hover:bg-indigo-500/10"
                        style={{ color: '#64748b' }}
                        title="ویرایش"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                        style={{ color: '#64748b' }}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
