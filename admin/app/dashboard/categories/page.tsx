'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Tag, Save, Loader2, X, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Search, Grid } from 'lucide-react';
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

const emptyForm = {
  name: '', slug: '', description: '',
  isActive: true, sortOrder: 0,
  metaTitle: '', metaDescription: '',
};

type Mode = 'list' | 'create' | 'edit';

const ICONS = ['⚡', '🚀', '🤖', '💼', '🌐', '🔧', '📱', '💡', '🎯', '📊', '🛒', '🔒'];

const slugify = (n: string) =>
  n.toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/--+/g, '-');

// ── FORM ── (standalone, NOT nested inside parent)
function CategoryForm({
  initial,
  onSave,
  onCancel,
  isPending,
  isEdit,
}: {
  initial: typeof emptyForm;
  onSave: (data: typeof emptyForm) => void;
  onCancel: () => void;
  isPending: boolean;
  isEdit: boolean;
}) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(initial);
  const [tab, setTab] = useState<'info' | 'seo'>('info');

  const set = (k: keyof typeof emptyForm, v: any) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('نام دسته‌بندی الزامی است'); nameRef.current?.focus(); return; }
    if (!form.slug.trim()) { toast.error('اسلاگ الزامی است'); return; }
    onSave(form);
  };

  return (
    <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 18, overflow: 'hidden' }}>
      {/* Form Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag style={{ width: 18, height: 18, color: '#6366f1' }} />
          </div>
          <h2 style={{ color: 'white', fontWeight: 700, margin: 0, fontSize: '1.125rem' }}>
            {isEdit ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}
          </h2>
        </div>
        <button type="button" onClick={onCancel} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', padding: '0.75rem 1.5rem 0', gap: 4 }}>
        {(['info', 'seo'] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} style={{
            padding: '7px 20px', borderRadius: '10px 10px 0 0', fontSize: '0.875rem', fontWeight: 600,
            background: tab === t ? '#4f46e5' : 'transparent',
            color: tab === t ? 'white' : '#64748b',
            border: 'none', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
            borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
          }}>
            {t === 'info' ? 'اطلاعات اصلی' : 'SEO'}
          </button>
        ))}
      </div>

      {/* Form body */}
      <div style={{ padding: '1.5rem' }}>
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            {/* Name + Slug */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>نام دسته‌بندی *</label>
                <input
                  ref={nameRef}
                  value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    setForm(prev => ({ ...prev, name, slug: isEdit ? prev.slug : slugify(name) }));
                  }}
                  placeholder="مثلاً: اسکریپت‌های پایتون"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label style={lbl}>اسلاگ URL *</label>
                <input
                  value={form.slug}
                  onChange={e => set('slug', e.target.value)}
                  className="input" dir="ltr"
                  placeholder="python-scripts"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>توضیحات</label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="توضیح کوتاهی درباره این دسته‌بندی..."
                rows={3}
                className="input"
                style={{ resize: 'vertical', minHeight: 80 }}
              />
            </div>

            {/* Icon picker */}
            <div>
              <label style={lbl}>ایکون (اختیاری)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {ICONS.map(icon => (
                  <button key={icon} type="button"
                    onClick={() => set('description', `${icon} ${form.description?.replace(/^[^\w\s]+\s*/, '')}`.trim())}
                    style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '1.375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort order + Active */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>ترتیب نمایش</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={e => set('sortOrder', parseInt(e.target.value) || 0)}
                  className="input" dir="ltr" min="0"
                />
                <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: 5 }}>عدد کمتر = نمایش اول</p>
              </div>
              <div>
                <label style={lbl}>وضعیت</label>
                <button
                  type="button"
                  onClick={() => set('isActive', !form.isActive)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: form.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', width: '100%', fontFamily: 'Vazirmatn, sans-serif', transition: 'all 0.2s' }}
                >
                  {form.isActive
                    ? <ToggleRight style={{ width: 24, height: 24, color: '#10b981', flexShrink: 0 }} />
                    : <ToggleLeft style={{ width: 24, height: 24, color: '#64748b', flexShrink: 0 }} />}
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: form.isActive ? '#10b981' : '#64748b', fontWeight: 600, fontSize: '0.875rem', margin: 0 }}>
                      {form.isActive ? 'فعال' : 'غیرفعال'}
                    </p>
                    <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>
                      {form.isActive ? 'نمایش داده می‌شود' : 'مخفی است'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.8125rem', margin: '0 0 3px' }}>راهنمای SEO</p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>عنوان ۵۰-۶۰ کاراکتر و توضیحات ۱۴۰-۱۶۰ کاراکتر برای گوگل بهتر است.</p>
            </div>
            <div>
              <label style={lbl}>عنوان متا</label>
              <input value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} className="input" placeholder={form.name || 'عنوان برای موتور جستجو...'} />
              <SeoBar value={form.metaTitle} min={50} max={60} />
            </div>
            <div>
              <label style={lbl}>توضیحات متا</label>
              <textarea value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} rows={4} className="input" style={{ resize: 'none' }} placeholder="توضیح کوتاه برای نتایج جستجوی گوگل..." />
              <SeoBar value={form.metaDescription} min={140} max={160} />
            </div>
            {(form.metaTitle || form.name) && (
              <div>
                <label style={lbl}>پیش‌نمایش گوگل</label>
                <div style={{ marginTop: 8, padding: '1.125rem', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.7rem', color: '#5f6368', margin: '0 0 2px', fontFamily: 'Arial', direction: 'ltr' }}>
                    digiscript.ir › categories › {form.slug || 'category'}
                  </p>
                  <p style={{ fontSize: '1.0625rem', color: '#1a0dab', margin: '0 0 4px', fontFamily: 'Arial', direction: 'rtl' }}>
                    {form.metaTitle || form.name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#4d5156', margin: 0, fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.5 }}>
                    {form.metaDescription || form.description || 'توضیحات دسته‌بندی...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button type="button" onClick={handleSave} disabled={isPending} className="btn-primary" style={{ opacity: isPending ? 0.6 : 1 }}>
            {isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">انصراف</button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──
export default function CategoriesPage() {
  const [mode, setMode] = useState<Mode>('list');
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (d: typeof emptyForm) => api.post('/categories', d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی ایجاد شد');
      setMode('list');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ایجاد'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof emptyForm }) =>
      api.put(`/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی به‌روزرسانی شد');
      setMode('list');
      setEditTarget(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در به‌روزرسانی'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('دسته‌بندی حذف شد');
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const handleDelete = (cat: Category) => {
    if (!confirm(`حذف "${cat.name}"؟ این عمل قابل بازگشت نیست.`)) return;
    deleteMutation.mutate(cat.id);
  };

  const startEdit = (cat: Category) => {
    setEditTarget(cat);
    setMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = (data || []).filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.375rem', margin: '0 0 4px' }}>دسته‌بندی‌ها</h1>
          <p style={{ color: '#475569', fontSize: '0.875rem', margin: 0 }}>{(data || []).length} دسته‌بندی موجود</p>
        </div>
        {mode === 'list' && (
          <button
            type="button"
            onClick={() => { setMode('create'); setEditTarget(null); }}
            className="btn-primary"
          >
            <Plus style={{ width: 17, height: 17 }} />
            دسته‌بندی جدید
          </button>
        )}
      </div>

      {/* Form panels */}
      {mode === 'create' && (
        <CategoryForm
          key="create-form"
          initial={emptyForm}
          isEdit={false}
          isPending={createMutation.isPending}
          onSave={(d) => createMutation.mutate(d)}
          onCancel={() => setMode('list')}
        />
      )}

      {mode === 'edit' && editTarget && (
        <CategoryForm
          key={`edit-${editTarget.id}`}
          initial={{
            name: editTarget.name,
            slug: editTarget.slug,
            description: editTarget.description || '',
            isActive: editTarget.isActive,
            sortOrder: editTarget.sortOrder,
            metaTitle: editTarget.metaTitle || '',
            metaDescription: editTarget.metaDescription || '',
          }}
          isEdit={true}
          isPending={updateMutation.isPending}
          onSave={(d) => updateMutation.mutate({ id: editTarget.id, data: d })}
          onCancel={() => { setMode('list'); setEditTarget(null); }}
        />
      )}

      {/* Search + list */}
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, overflow: 'hidden' }}>
        {/* List toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#64748b' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="جستجو در دسته‌بندی‌ها..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 36px 7px 10px', color: 'white', fontSize: '0.875rem', fontFamily: 'Vazirmatn, sans-serif', outline: 'none' }}
            />
          </div>
          <span style={{ color: '#475569', fontSize: '0.8125rem', flexShrink: 0 }}>{categories.length} مورد</span>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Tag style={{ width: 32, height: 32, color: '#6366f1' }} />
            </div>
            <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 8px' }}>
              {search ? 'نتیجه‌ای یافت نشد' : 'هنوز دسته‌بندی‌ای ایجاد نشده'}
            </h3>
            <p style={{ color: '#475569', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
              {search ? `جستجو برای "${search}" نتیجه‌ای نداشت` : 'اولین دسته‌بندی را ایجاد کنید'}
            </p>
            {!search && (
              <button type="button" onClick={() => setMode('create')} className="btn-primary">
                <Plus style={{ width: 16, height: 16 }} />دسته‌بندی جدید
              </button>
            )}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['دسته‌بندی', 'اسلاگ', 'ترتیب', 'وضعیت', ''].map(h => (
                  <th key={h} style={{ textAlign: 'right', padding: '12px 16px', color: '#475569', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.sort((a, b) => a.sortOrder - b.sortOrder).map((cat) => (
                <tr
                  key={cat.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.15s', cursor: 'default' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: cat.isActive ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.125rem' }}>
                        {cat.description?.match(/^[^\w\s]+/)?.[0] || <Tag style={{ width: 17, height: 17, color: cat.isActive ? '#6366f1' : '#475569' }} />}
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem', margin: '0 0 2px' }}>{cat.name}</p>
                        {cat.description && (
                          <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cat.description.replace(/^[^\w\s]+\s*/, '')}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ fontSize: '0.8125rem', padding: '3px 8px', borderRadius: 7, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', letterSpacing: '0.03em' }}>
                      {cat.slug}
                    </code>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button type="button" onClick={() => updateMutation.mutate({ id: cat.id, data: { name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive, sortOrder: Math.max(0, cat.sortOrder - 1), metaTitle: cat.metaTitle || '', metaDescription: cat.metaDescription || '' } })}
                        style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ChevronUp style={{ width: 13, height: 13 }} />
                      </button>
                      <span style={{ color: '#94a3b8', fontSize: '0.875rem', minWidth: 28, textAlign: 'center' }}>{cat.sortOrder}</span>
                      <button type="button" onClick={() => updateMutation.mutate({ id: cat.id, data: { name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive, sortOrder: cat.sortOrder + 1, metaTitle: cat.metaTitle || '', metaDescription: cat.metaDescription || '' } })}
                        style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <ChevronDown style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button type="button"
                      onClick={() => updateMutation.mutate({ id: cat.id, data: { name: cat.name, slug: cat.slug, description: cat.description || '', isActive: !cat.isActive, sortOrder: cat.sortOrder, metaTitle: cat.metaTitle || '', metaDescription: cat.metaDescription || '' } })}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: cat.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)', border: `1px solid ${cat.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(100,116,139,0.2)'}`, color: cat.isActive ? '#10b981' : '#64748b', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', transition: 'all 0.2s' }}>
                      {cat.isActive
                        ? <ToggleRight style={{ width: 15, height: 15 }} />
                        : <ToggleLeft style={{ width: 15, height: 15 }} />}
                      {cat.isActive ? 'فعال' : 'غیرفعال'}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(cat)}
                        title="ویرایش"
                        style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.18)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.08)'; }}
                      >
                        <Edit2 style={{ width: 15, height: 15 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat)}
                        disabled={deleteMutation.isPending}
                        title="حذف"
                        style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.18)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.07)'; }}
                      >
                        <Trash2 style={{ width: 15, height: 15 }} />
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

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8 };

const SeoBar = ({ value, min, max }: { value: string; min: number; max: number }) => {
  const n = value.length;
  const color = n === 0 ? '#475569' : (n >= min && n <= max) ? '#10b981' : '#f59e0b';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: color, width: `${Math.min(100, n > 0 ? (n / max) * 100 : 0)}%`, transition: 'all 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 600, minWidth: 80 }}>
        {n === 0 ? 'خالی' : (n >= min && n <= max) ? '✓ مناسب' : n < min ? '↑ کوتاه' : '↓ بلند'} ({n})
      </span>
    </div>
  );
};
