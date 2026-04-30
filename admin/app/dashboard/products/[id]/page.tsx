'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowRight, Package, Image as ImageIcon, File } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), { ssr: false });
const FileManager = dynamic(() => import('@/components/ui/FileManager'), { ssr: false });

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'content' | 'media' | 'meta'>('basic');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', shortDescription: '', fullDescription: '',
    features: [] as string[], price: '', supportPrice: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    demoUrl: '', version: '1.0.0', tags: [] as string[],
    categoryIds: [] as string[], metaTitle: '', metaDescription: '',
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-detail', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${params.id}`);
      return data.data;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data; },
  });

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        fullDescription: product.fullDescription || '',
        features: product.features || [],
        price: product.price || '',
        supportPrice: product.supportPrice || '',
        status: product.status || 'draft',
        demoUrl: product.demoUrl || '',
        version: product.version || '1.0.0',
        tags: product.tags || [],
        categoryIds: (product.categories || []).map((c: any) => c.id),
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      });
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: res } = await api.put(`/products/${params.id}`, data);
      return res;
    },
    onSuccess: () => {
      toast.success('محصول با موفقیت به‌روزرسانی شد');
      queryClient.invalidateQueries({ queryKey: ['product-detail', params.id] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا در به‌روزرسانی'),
  });

  const addFeature = () => {
    if (newFeature.trim()) { setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); }
  };
  const addTag = () => {
    if (newTag.trim()) { setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] })); setNewTag(''); }
  };

  const tabs = [
    { id: 'basic', label: 'اطلاعات اصلی' },
    { id: 'pricing', label: 'قیمت‌گذاری' },
    { id: 'content', label: 'محتوا' },
    { id: 'media', label: 'رسانه' },
    { id: 'meta', label: 'SEO' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366f1' }} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products" className="p-2 rounded-lg transition-all hover:bg-white/10" style={{ color: '#64748b' }}>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: '#6366f1' }} />
            <h2 className="text-xl font-bold text-white">ویرایش: {product?.title}</h2>
          </div>
        </div>
        <span
          className="badge text-xs"
          style={{
            background: form.status === 'published' ? 'rgba(16,185,129,0.1)' : form.status === 'draft' ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)',
            color: form.status === 'published' ? '#10b981' : form.status === 'draft' ? '#f59e0b' : '#64748b',
          }}
        >
          {form.status === 'published' ? 'منتشر شده' : form.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
            style={{ background: activeTab === tab.id ? '#4f46e5' : 'transparent', color: activeTab === tab.id ? 'white' : '#64748b' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>عنوان محصول</label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>اسلاگ</label>
                <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>توضیح کوتاه</label>
              <textarea value={form.shortDescription} onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={3} className="input resize-none" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>لینک دمو</label>
                <input value={form.demoUrl} onChange={(e) => setForm(f => ({ ...f, demoUrl: e.target.value }))} className="input" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>وضعیت</label>
                <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))} className="input">
                  <option value="draft">پیش‌نویس</option>
                  <option value="published">منتشر شده</option>
                  <option value="archived">بایگانی</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>قیمت (تومان)</label>
                <input value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="input" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>قیمت پشتیبانی</label>
                <input value={form.supportPrice} onChange={(e) => setForm(f => ({ ...f, supportPrice: e.target.value }))} className="input" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>نسخه</label>
                <input value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} className="input" dir="ltr" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: '#cbd5e1' }}>دسته‌بندی‌ها</label>
              <div className="flex flex-wrap gap-2">
                {(categoriesData || []).map((cat: any) => (
                  <button key={cat.id} type="button"
                    onClick={() => setForm(f => ({ ...f, categoryIds: f.categoryIds.includes(cat.id) ? f.categoryIds.filter(id => id !== cat.id) : [...f.categoryIds, cat.id] }))}
                    className="badge cursor-pointer transition-all"
                    style={{ background: form.categoryIds.includes(cat.id) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: form.categoryIds.includes(cat.id) ? '#a5b4fc' : '#94a3b8', border: `1px solid ${form.categoryIds.includes(cat.id) ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, padding: '0.4rem 0.8rem' }}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>برچسب‌ها</label>
              <div className="flex gap-2 mb-2">
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="برچسب..." className="input flex-1" />
                <button type="button" onClick={addTag} className="btn-secondary px-3">+</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((t, i) => (
                  <span key={i} className="badge flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '0.35rem 0.7rem' }}>
                    {t}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{ color: '#64748b' }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>توضیحات کامل</label>
              <RichEditor key={product?.id} value={form.fullDescription} onChange={(v) => setForm(f => ({ ...f, fullDescription: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#cbd5e1' }}>ویژگی‌ها</label>
              <div className="flex gap-2 mb-3">
                <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="یک ویژگی اضافه کنید..." className="input flex-1" />
                <button type="button" onClick={addFeature} className="btn-secondary px-3">+</button>
              </div>
              <div className="space-y-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
                    <span className="flex-1 text-sm text-white">{f}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} style={{ color: '#64748b' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5" style={{ color: '#6366f1' }} />
                <h3 className="text-white font-semibold">تصاویر محصول</h3>
              </div>
              <FileManager productId={params.id} type="images" />
            </div>
            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <File className="w-5 h-5" style={{ color: '#6366f1' }} />
                <h3 className="text-white font-semibold">فایل‌های دانلود</h3>
              </div>
              <FileManager productId={params.id} type="files" />
            </div>
          </div>
        )}

        {activeTab === 'meta' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>عنوان SEO</label>
              <input value={form.metaTitle} onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" />
              <p className="text-xs mt-1" style={{ color: '#475569' }}>{form.metaTitle.length}/60 کاراکتر</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#cbd5e1' }}>توضیحات SEO</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={4} className="input resize-none" />
              <p className="text-xs mt-1" style={{ color: '#475569' }}>{form.metaDescription.length}/160 کاراکتر</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(form)} className="btn-primary" style={{ opacity: mutation.isPending ? 0.6 : 1 }}>
          <Save className="w-4 h-4" />
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </button>
        <Link href="/dashboard/products" className="btn-secondary">انصراف</Link>
      </div>
    </div>
  );
}
