'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, ArrowRight, Plus, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    features: [] as string[],
    price: '',
    supportPrice: '',
    status: 'draft' as const,
    demoUrl: '',
    version: '1.0.0',
    tags: [] as string[],
    categoryIds: [] as string[],
    metaTitle: '',
    metaDescription: '',
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const { data: res } = await api.post('/products', data);
      return res;
    },
    onSuccess: () => router.push('/dashboard/products'),
    onError: (err: any) => setError(err?.response?.data?.message || 'خطا در ایجاد محصول'),
  });

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const addTag = () => {
    if (newTag.trim()) {
      setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutation.mutate(form);
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="text-slate-400 hover:text-white transition-colors">
          <ArrowRight className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-white">محصول جدید</h2>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-white font-semibold mb-2">اطلاعات اصلی</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">عنوان محصول *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm(f => ({ ...f, title: e.target.value, slug: generateSlug(e.target.value) }));
                }}
                placeholder="مثلاً: ربات تلگرام فروشگاه"
                required
                className="input"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">اسلاگ *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="telegram-shop-bot"
                required
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">توضیح کوتاه *</label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))}
              rows={3}
              required
              className="input resize-none"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">توضیح کامل (HTML پشتیبانی می‌شود) *</label>
            <textarea
              value={form.fullDescription}
              onChange={(e) => setForm(f => ({ ...f, fullDescription: e.target.value }))}
              rows={10}
              required
              className="input resize-none font-mono text-xs"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h3 className="text-white font-semibold mb-2">قیمت‌گذاری</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">قیمت (تومان) *</label>
              <input
                value={form.price}
                onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="490000"
                required
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">قیمت پشتیبانی</label>
              <input
                value={form.supportPrice}
                onChange={(e) => setForm(f => ({ ...f, supportPrice: e.target.value }))}
                placeholder="150000"
                className="input"
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">نسخه</label>
              <input
                value={form.version}
                onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))}
                className="input"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card p-6 space-y-4">
          <h3 className="text-white font-semibold">ویژگی‌ها</h3>
          <div className="flex gap-2">
            <input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              placeholder="ویژگی را تایپ کنید و Enter بزنید"
              className="input"
            />
            <button type="button" onClick={addFeature} className="btn-secondary whitespace-nowrap">
              <Plus className="w-4 h-4" />
              افزودن
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map((f, i) => (
              <span key={i} className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 gap-1.5">
                {f}
                <button type="button" onClick={() => setForm(prev => ({ ...prev, features: prev.features.filter((_, j) => j !== i) }))} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Tags & Categories */}
        <div className="card p-6 space-y-4">
          <h3 className="text-white font-semibold">برچسب‌ها و دسته‌بندی‌ها</h3>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">برچسب‌ها</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="برچسب را وارد کنید"
                className="input"
              />
              <button type="button" onClick={addTag} className="btn-secondary whitespace-nowrap">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((t, i) => (
                <span key={i} className="badge bg-slate-800 text-slate-300 gap-1.5">
                  {t}
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, tags: prev.tags.filter((_, j) => j !== i) }))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium mb-1.5 block">دسته‌بندی‌ها</label>
            <div className="flex flex-wrap gap-2">
              {(categoriesData || []).map((cat: any) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm(f => ({
                    ...f,
                    categoryIds: f.categoryIds.includes(cat.id)
                      ? f.categoryIds.filter(id => id !== cat.id)
                      : [...f.categoryIds, cat.id],
                  }))}
                  className={`badge cursor-pointer transition-all ${
                    form.categoryIds.includes(cat.id)
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Publishing */}
        <div className="card p-6 space-y-4">
          <h3 className="text-white font-semibold">انتشار</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">وضعیت</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="input"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">بایگانی</option>
              </select>
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">لینک دمو</label>
              <input
                value={form.demoUrl}
                onChange={(e) => setForm(f => ({ ...f, demoUrl: e.target.value }))}
                placeholder="https://demo.example.com"
                className="input"
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">عنوان SEO</label>
              <input
                value={form.metaTitle}
                onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="text-slate-300 text-sm font-medium mb-1.5 block">توضیحات SEO</label>
              <input
                value={form.metaDescription}
                onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary disabled:opacity-50">
            <Save className="w-4 h-4" />
            {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره محصول'}
          </button>
          <Link href="/dashboard/products" className="btn-secondary">انصراف</Link>
        </div>
      </form>
    </div>
  );
}
