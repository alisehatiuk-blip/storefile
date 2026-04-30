'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Save, ArrowRight, Plus, X, Package, Image as ImageIcon, DollarSign, FileText, Search, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), { ssr: false, loading: () => <div style={{ height: 240, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.875rem' }}>در حال بارگذاری ادیتور...</div> });

const TABS = [
  { id: 'basic', label: 'اطلاعات پایه', icon: Package },
  { id: 'pricing', label: 'قیمت و دسته‌بندی', icon: DollarSign },
  { id: 'content', label: 'محتوا و ویژگی‌ها', icon: FileText },
  { id: 'seo', label: 'SEO', icon: Search },
];

type Tab = 'basic' | 'pricing' | 'content' | 'seo';

export default function NewProductPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('basic');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [form, setForm] = useState({
    title: '', slug: '', shortDescription: '', fullDescription: '',
    features: [] as string[], price: '', supportPrice: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    demoUrl: '', version: '1.0.0',
    tags: [] as string[], categoryIds: [] as string[],
    metaTitle: '', metaDescription: '',
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data || []; },
  });

  const mutation = useMutation({
    mutationFn: async (d: typeof form) => {
      const { data } = await api.post('/products', d);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success('محصول ایجاد شد — حالا فایل‌ها و تصاویر اضافه کنید');
      router.push(`/dashboard/products/${data.id}`);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ایجاد محصول'),
  });

  const slug = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-');
  const addFeature = () => { if (newFeature.trim()) { setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); } };
  const addTag = () => { if (newTag.trim()) { setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] })); setNewTag(''); } };

  const isValid = form.title.trim() && form.slug.trim() && form.price.trim() && form.shortDescription.trim();

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/dashboard/products" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}>
          <ArrowRight style={{ width: 16, height: 16 }} />
          محصولات
        </Link>
        <ChevronRight style={{ width: 14, height: 14, color: '#334155' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>محصول جدید</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 22, height: 22, color: '#6366f1' }} />
          </div>
          <div>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.375rem', margin: 0 }}>افزودن محصول جدید</h1>
            <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>اطلاعات محصول را وارد کنید</p>
          </div>
        </div>
        <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))} className="input" style={{ width: 'auto' }}>
          <option value="draft">📝 پیش‌نویس</option>
          <option value="published">✅ منتشر شده</option>
          <option value="archived">📦 بایگانی</option>
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', gap: 2 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.625rem 0.75rem', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500,
              background: active ? '#4f46e5' : 'transparent',
              color: active ? 'white' : '#64748b',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'Vazirmatn, sans-serif',
            }}>
              <Icon style={{ width: 15, height: 15 }} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <div className="card" style={{ padding: '1.75rem' }}>
        {/* ── BASIC ── */}
        {tab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>عنوان محصول <span style={{ color: '#ef4444' }}>*</span></label>
                <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value, slug: slug(e.target.value) }))} placeholder="مثلاً: ربات تلگرام فروشگاه" className="input" />
              </div>
              <div>
                <label style={lbl}>اسلاگ (URL) <span style={{ color: '#ef4444' }}>*</span></label>
                <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" placeholder="telegram-shop-bot" />
              </div>
            </div>
            <div>
              <label style={lbl}>توضیح کوتاه <span style={{ color: '#ef4444' }}>*</span></label>
              <textarea value={form.shortDescription} onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={3} className="input" style={{ resize: 'none' }} placeholder="یک توضیح جذاب از محصول که در کارت‌ها نمایش داده می‌شود..." />
              <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: 4 }}>{form.shortDescription.length}/200 کاراکتر</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>نسخه</label>
                <input value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} className="input" dir="ltr" placeholder="1.0.0" />
              </div>
              <div>
                <label style={lbl}>لینک دمو</label>
                <input value={form.demoUrl} onChange={(e) => setForm(f => ({ ...f, demoUrl: e.target.value }))} className="input" dir="ltr" placeholder="https://demo.example.com" type="url" />
              </div>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>قیمت (تومان) <span style={{ color: '#ef4444' }}>*</span></label>
                <input value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="input" dir="ltr" placeholder="490000" />
              </div>
              <div>
                <label style={lbl}>قیمت پشتیبانی سالانه</label>
                <input value={form.supportPrice} onChange={(e) => setForm(f => ({ ...f, supportPrice: e.target.value }))} className="input" dir="ltr" placeholder="150000" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {form.price && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0 0 2px' }}>قیمت نهایی</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                      {(parseInt(form.price) || 0).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={lbl}>دسته‌بندی‌ها</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {(catsData || []).map((cat: any) => {
                  const sel = form.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button"
                      onClick={() => setForm(f => ({ ...f, categoryIds: sel ? f.categoryIds.filter(id => id !== cat.id) : [...f.categoryIds, cat.id] }))}
                      style={{ padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Vazirmatn, sans-serif', background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#a5b4fc' : '#94a3b8', border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
                      {sel && '✓ '}{cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={lbl}>برچسب‌ها</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 8 }}>
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="برچسب را تایپ کرده و Enter بزنید" className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addTag} className="btn-secondary" style={{ padding: '0 1rem' }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.tags.map((t, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.3rem 0.7rem', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8125rem' }}>
                    {t}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={lbl}>توضیحات کامل محصول <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ marginTop: 8 }}>
                <RichEditor value={form.fullDescription} onChange={(v) => setForm(f => ({ ...f, fullDescription: v }))} placeholder="توضیحات کامل، قابلیت‌ها و نحوه استفاده از محصول را اینجا بنویسید..." />
              </div>
            </div>
            <div>
              <label style={lbl}>ویژگی‌های کلیدی</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 10 }}>
                <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="یک ویژگی اضافه کنید..." className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addFeature} className="btn-secondary" style={{ padding: '0 1rem' }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              {form.features.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {form.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                      <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9rem' }}>{f}</span>
                      <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
                        <X style={{ width: 14, height: 14 }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {form.features.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#334155', fontSize: '0.875rem', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                  هنوز ویژگی‌ای اضافه نشده
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEO ── */}
        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', marginBottom: 8 }}>
              <p style={{ color: '#6366f1', fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 4px' }}>راهنمای SEO</p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>برای بهتر دیده شدن در گوگل، عنوان و توضیح متا را پر کنید. عنوان بین ۵۰-۶۰ و توضیحات بین ۱۴۰-۱۶۰ کاراکتر باشد.</p>
            </div>
            <div>
              <label style={lbl}>عنوان متا (Meta Title)</label>
              <input value={form.metaTitle} onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" placeholder="عنوان بهینه برای موتورهای جستجو..." />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>
                  {form.metaTitle.length < 50 ? '⚠️ کوتاه' : form.metaTitle.length <= 60 ? '✅ مناسب' : '⚠️ بلند'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaTitle.length}/60</p>
              </div>
            </div>
            <div>
              <label style={lbl}>توضیحات متا (Meta Description)</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={4} className="input" style={{ resize: 'none' }} placeholder="توضیح کوتاه که در نتایج گوگل نمایش داده می‌شود..." />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>
                  {form.metaDescription.length < 140 ? '⚠️ کوتاه' : form.metaDescription.length <= 160 ? '✅ مناسب' : '⚠️ بلند'}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaDescription.length}/160</p>
              </div>
            </div>
            {/* Preview */}
            {(form.metaTitle || form.metaDescription) && (
              <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.7rem', color: '#1a73e8', margin: '0 0 2px', fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>
                  {(process.env.NEXT_PUBLIC_API_URL || 'digiscript.ir').replace(/\/api$/, '')} › products › {form.slug || 'product-slug'}
                </p>
                <p style={{ fontSize: '1.1rem', color: '#1a0dab', margin: '0 0 4px', fontFamily: 'Arial, sans-serif', fontWeight: 400, direction: 'rtl' }}>
                  {form.metaTitle || form.title || 'عنوان محصول'}
                </p>
                <p style={{ fontSize: '0.8125rem', color: '#4d5156', margin: 0, fontFamily: 'Arial, sans-serif', lineHeight: 1.5, direction: 'rtl' }}>
                  {form.metaDescription || form.shortDescription || 'توضیحات محصول...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map((t, i) => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{
              width: 8, height: 8, borderRadius: '50%', background: tab === t.id ? '#6366f1' : 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/products" className="btn-secondary" style={{ fontSize: '0.875rem' }}>انصراف</Link>
          <button type="button" disabled={!isValid || mutation.isPending} onClick={() => mutation.mutate(form)} className="btn-primary" style={{ fontSize: '0.875rem', opacity: (!isValid || mutation.isPending) ? 0.6 : 1 }}>
            {mutation.isPending ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} /> در حال ذخیره...</> : <><Save style={{ width: 16, height: 16 }} />ذخیره محصول</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: '0.01em' };
