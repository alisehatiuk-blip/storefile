'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Save, ArrowRight, Plus, X, Package, DollarSign, FileText,
  Search, Image as ImageIcon, ChevronRight, Loader2, ExternalLink,
  FolderOpen, Eye, BarChart2, Tag,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import FileManagerModal from './FileManagerModal';

const RichEditor = dynamic(() => import('./RichEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 480, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Loader2 style={{ width: 20, height: 20, color: '#475569', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#475569', fontSize: '0.875rem' }}>در حال بارگذاری ادیتور...</span>
    </div>
  ),
});

const TABS = [
  { id: 'basic', label: 'اطلاعات پایه', icon: Package },
  { id: 'pricing', label: 'قیمت و دسته‌بندی', icon: DollarSign },
  { id: 'content', label: 'محتوا و ویژگی‌ها', icon: FileText },
  { id: 'media', label: 'تصاویر و فایل', icon: ImageIcon },
  { id: 'seo', label: 'SEO', icon: Search },
];
type Tab = 'basic' | 'pricing' | 'content' | 'media' | 'seo';

interface FormState {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  price: string;
  supportPrice: string;
  status: 'draft' | 'published' | 'archived';
  demoUrl: string;
  version: string;
  tags: string[];
  categoryIds: string[];
  metaTitle: string;
  metaDescription: string;
}

const empty: FormState = {
  title: '', slug: '', shortDescription: '', fullDescription: '',
  features: [], price: '', supportPrice: '',
  status: 'draft', demoUrl: '', version: '1.0.0',
  tags: [], categoryIds: [], metaTitle: '', metaDescription: '',
};

interface Props {
  productId?: string; // undefined = create mode
}

const slugify = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '').replace(/--+/g, '-');

export default function ProductFormShared({ productId }: Props) {
  const isEdit = !!productId;
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<Tab>('basic');
  const [form, setForm] = useState<FormState>(empty);
  const [fmOpen, setFmOpen] = useState<'images' | 'files' | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Load product (edit mode)
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product-full', productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data.data;
    },
    enabled: isEdit,
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data || [];
    },
  });

  // Populate form when product loads
  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        shortDescription: product.shortDescription || '',
        fullDescription: product.fullDescription || '',
        features: Array.isArray(product.features) ? product.features : [],
        price: product.price || '',
        supportPrice: product.supportPrice || '',
        status: product.status || 'draft',
        demoUrl: product.demoUrl || '',
        version: product.version || '1.0.0',
        tags: Array.isArray(product.tags) ? product.tags : [],
        categoryIds: (product.categories || []).map((c: any) => c.id),
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
      });
    }
  }, [product]);

  const createMutation = useMutation({
    mutationFn: async (d: FormState) => {
      const { data } = await api.post('/products', d);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success('محصول ایجاد شد — حالا رسانه اضافه کنید');
      window.location.href = `/dashboard/products/${data.id}`;
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ایجاد محصول'),
  });

  const updateMutation = useMutation({
    mutationFn: async (d: FormState) => {
      const { data } = await api.put(`/products/${productId}`, d);
      return data;
    },
    onSuccess: () => {
      toast.success('محصول ذخیره شد');
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['product-full', productId] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ذخیره'),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const save = () => {
    if (!form.title.trim()) { toast.error('عنوان محصول الزامی است'); setTab('basic'); return; }
    if (!form.price.trim()) { toast.error('قیمت الزامی است'); setTab('pricing'); return; }
    if (isEdit) updateMutation.mutate(form);
    else createMutation.mutate(form);
  };

  const addFeature = () => {
    if (newFeature.trim()) { setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); }
  };

  const addTag = () => {
    if (newTag.trim()) { setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] })); setNewTag(''); }
  };

  if (isEdit && productLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Loader2 style={{ width: 36, height: 36, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statusColor = { published: '#10b981', draft: '#f59e0b', archived: '#64748b' }[form.status] || '#64748b';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <Link href="/dashboard/products" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', textDecoration: 'none' }}>
            <ArrowRight style={{ width: 14, height: 14 }} />محصولات
          </Link>
          <ChevronRight style={{ width: 12, height: 12, color: '#334155' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>{isEdit ? 'ویرایش محصول' : 'محصول جدید'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {isEdit && product?.images?.[0]?.url ? (
              <img src={product.images[0].url} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: 24, height: 24, color: '#6366f1' }} />
              </div>
            )}
            <div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.375rem', margin: '0 0 6px' }}>
                {isEdit ? (form.title || product?.title || 'ویرایش محصول') : 'محصول جدید'}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 20, background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}30` }}>
                  {form.status === 'published' ? 'منتشر شده' : form.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
                </span>
                {isEdit && <span style={{ color: '#475569', fontSize: '0.75rem' }}>v{form.version} · {product?.downloadCount || 0} دانلود</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
              className="input"
              style={{ width: 'auto', fontSize: '0.875rem', padding: '7px 12px' }}
            >
              <option value="draft">📝 پیش‌نویس</option>
              <option value="published">✅ منتشر</option>
              <option value="archived">📦 بایگانی</option>
            </select>
            {isEdit && product?.slug && (
              <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#94a3b8', fontSize: '0.8125rem', textDecoration: 'none' }}>
                <Eye style={{ width: 14, height: 14 }} />پیش‌نمایش
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', gap: 2, overflowX: 'auto' }}>
        {TABS.filter(t => isEdit || t.id !== 'media').map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} type="button" onClick={() => setTab(t.id as Tab)} style={{
              flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.625rem 0.5rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 600,
              background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#64748b',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Vazirmatn, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
              <span>{t.label}</span>
            </button>
          );
        })}
        {isEdit && (
          <button type="button" onClick={() => setTab('media' as Tab)} style={{
            flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0.625rem 0.5rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 600,
            background: tab === 'media' ? '#4f46e5' : 'transparent', color: tab === 'media' ? 'white' : '#64748b',
            border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Vazirmatn, sans-serif', whiteSpace: 'nowrap',
          }}>
            <ImageIcon style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>رسانه</span>
          </button>
        )}
      </div>

      {/* Panel — always full width */}
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '1.75rem' }}>

        {/* ── BASIC ── */}
        {tab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <F label="عنوان محصول *">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: isEdit ? f.slug : slugify(e.target.value) }))} placeholder="مثلاً: ربات تلگرام فروشگاه" className="input" autoFocus />
              </F>
              <F label="اسلاگ URL *">
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" placeholder="telegram-shop-bot" />
              </F>
            </div>
            <F label="توضیح کوتاه *">
              <textarea value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={4} className="input" style={{ resize: 'vertical', minHeight: 100 }} placeholder="یک توضیح جذاب که در کارت محصول نمایش داده می‌شود..." />
              <Bar current={form.shortDescription.length} max={200} />
            </F>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <F label="نسخه">
                <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} className="input" dir="ltr" placeholder="1.0.0" />
              </F>
              <F label="لینک دمو">
                <input value={form.demoUrl} onChange={e => setForm(f => ({ ...f, demoUrl: e.target.value }))} className="input" dir="ltr" placeholder="https://demo.example.com" type="url" />
              </F>
            </div>
          </div>
        )}

        {/* ── PRICING ── */}
        {tab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <F label="قیمت (تومان) *">
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input" dir="ltr" placeholder="490000" />
              </F>
              <F label="قیمت پشتیبانی سالانه">
                <input value={form.supportPrice} onChange={e => setForm(f => ({ ...f, supportPrice: e.target.value }))} className="input" dir="ltr" placeholder="150000" />
              </F>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: 2 }}>
                {form.price && (
                  <div style={{ padding: '0.875rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)' }}>
                    <p style={{ color: '#6366f1', fontSize: '0.7rem', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>مجموع با پشتیبانی</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>
                      {(+(form.price || 0) + +(form.supportPrice || 0)).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                )}
              </div>
            </div>
            <F label="دسته‌بندی‌ها">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {(catsData || []).map((cat: any) => {
                  const sel = form.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button"
                      onClick={() => setForm(f => ({ ...f, categoryIds: sel ? f.categoryIds.filter(id => id !== cat.id) : [...f.categoryIds, cat.id] }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#a5b4fc' : '#94a3b8', border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.15s' }}>
                      <Tag style={{ width: 12, height: 12 }} />
                      {cat.name}
                      {sel && <span style={{ color: '#6366f1', fontWeight: 700 }}>✓</span>}
                    </button>
                  );
                })}
                {(catsData || []).length === 0 && (
                  <p style={{ color: '#475569', fontSize: '0.875rem' }}>هنوز دسته‌بندی‌ای ایجاد نشده</p>
                )}
              </div>
            </F>
            <F label="برچسب‌ها">
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="برچسب را تایپ کرده و Enter بزنید..." className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addTag} className="btn-primary" style={{ padding: '0 16px', flexShrink: 0 }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.tags.map((t, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '0.35rem 0.875rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8125rem' }}>
                    {t}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, lineHeight: 1, fontSize: '1rem', display: 'flex' }}>×</button>
                  </span>
                ))}
                {form.tags.length === 0 && <p style={{ color: '#334155', fontSize: '0.8125rem' }}>هنوز برچسبی اضافه نشده</p>}
              </div>
            </F>
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <F label="توضیحات کامل محصول *">
              <div style={{ marginTop: 8 }}>
                <RichEditor
                  key={`editor-${productId || 'new'}`}
                  value={form.fullDescription}
                  onChange={v => setForm(f => ({ ...f, fullDescription: v }))}
                  minHeight={520}
                  placeholder="محتوای کامل محصول را اینجا بنویسید — از ادیتور برای قالب‌بندی استفاده کنید..."
                  onImageInsert={() => isEdit ? setFmOpen('images') : undefined}
                />
              </div>
            </F>
            <F label="ویژگی‌های کلیدی">
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="ویژگی را تایپ کرده و Enter بزنید..." className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addFeature} className="btn-primary" style={{ padding: '0 16px', flexShrink: 0 }}>
                  <Plus style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.14)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9375rem' }}>{feat}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, display: 'flex' }}>
                      <X style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                ))}
                {form.features.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#334155', fontSize: '0.875rem', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.07)' }}>
                    هنوز ویژگی‌ای اضافه نشده
                  </div>
                )}
              </div>
            </F>
          </div>
        )}

        {/* ── MEDIA (edit only) ── */}
        {tab === 'media' && isEdit && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Images */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 3px' }}>تصاویر محصول</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.images || []).length} تصویر آپلود شده</p>
                </div>
                <button type="button" onClick={() => setFmOpen('images')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 15, height: 15 }} />باز کردن فایل منیجر
                </button>
              </div>
              {(product?.images || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                  {(product?.images || []).map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.08)' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.isPrimary && <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(79,70,229,0.9)', borderRadius: 6, padding: '2px 7px', fontSize: '0.65rem', color: 'white', fontWeight: 600, backdropFilter: 'blur(4px)' }}>اصلی</div>}
                    </div>
                  ))}
                  <button type="button" onClick={() => setFmOpen('images')} style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed rgba(99,102,241,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.04)', color: '#6366f1', gap: 6, fontFamily: 'Vazirmatn, sans-serif', fontSize: '0.75rem' }}>
                    <Plus style={{ width: 22, height: 22 }} />افزودن
                  </button>
                </div>
              ) : (
                <div onClick={() => setFmOpen('images')} style={{ textAlign: 'center', padding: '3rem', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.35)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <ImageIcon style={{ width: 44, height: 44, margin: '0 auto 12px', color: '#334155' }} />
                  <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>هنوز تصویری آپلود نشده</p>
                  <p style={{ color: '#334155', fontSize: '0.8125rem', margin: 0 }}>برای باز کردن فایل منیجر کلیک کنید</p>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 }} />

            {/* Files */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 3px' }}>فایل‌های دانلود</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.files || []).length} فایل آپلود شده</p>
                </div>
                <button type="button" onClick={() => setFmOpen('files')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 15, height: 15 }} />باز کردن فایل منیجر
                </button>
              </div>
              {(product?.files || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(product?.files || []).map((f: any) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText style={{ width: 18, height: 18, color: '#6366f1' }} />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{f.fileName}</p>
                        <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>نسخه {f.version || '1.0.0'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div onClick={() => setFmOpen('files')} style={{ textAlign: 'center', padding: '3rem', borderRadius: 16, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <FileText style={{ width: 44, height: 44, margin: '0 auto 12px', color: '#334155' }} />
                  <p style={{ color: '#64748b', fontWeight: 600, margin: '0 0 4px' }}>هنوز فایلی آپلود نشده</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEO ── */}
        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.875rem', margin: '0 0 4px' }}>راهنمای SEO</p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>عنوان ۵۰-۶۰ کاراکتر و توضیحات ۱۴۰-۱۶۰ کاراکتر بهترین نتیجه در گوگل را می‌دهد.</p>
            </div>
            <F label="عنوان متا (Meta Title)">
              <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" placeholder={form.title || 'عنوان محصول...'} />
              <SeoBar value={form.metaTitle} min={50} max={60} />
            </F>
            <F label="توضیحات متا (Meta Description)">
              <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={4} className="input" style={{ resize: 'none' }} placeholder={form.shortDescription || 'توضیح کوتاه برای نتایج جستجو...'} />
              <SeoBar value={form.metaDescription} min={140} max={160} />
            </F>

            {/* Google preview */}
            {(form.metaTitle || form.metaDescription || form.title) && (
              <F label="پیش‌نمایش گوگل">
                <div style={{ marginTop: 8, padding: '1.25rem', borderRadius: 14, background: '#fff', border: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.7rem', color: '#5f6368', margin: '0 0 2px', fontFamily: 'Arial', direction: 'ltr' }}>
                    digiscript.ir › products › {form.slug || 'product-url'}
                  </p>
                  <p style={{ fontSize: '1.125rem', color: '#1a0dab', margin: '0 0 4px', fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.3 }}>
                    {form.metaTitle || form.title || 'عنوان محصول'}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#4d5156', margin: 0, fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.5 }}>
                    {form.metaDescription || form.shortDescription || 'توضیحات محصول...'}
                  </p>
                </div>
              </F>
            )}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.375rem', borderRadius: 14, transition: 'all 0.3s',
        background: savedIndicator ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${savedIndicator ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id as Tab)} style={{
              width: 8, height: 8, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s',
              background: tab === t.id ? '#6366f1' : 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {savedIndicator && (
            <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓ تغییرات ذخیره شد</span>
          )}
          <Link href="/dashboard/products" style={{ padding: '8px 18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'Vazirmatn, sans-serif' }}>
            انصراف
          </Link>
          <button type="button" disabled={isPending} onClick={save} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 22px',
            background: isPending ? 'rgba(79,70,229,0.5)' : '#4f46e5',
            color: 'white', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'Vazirmatn, sans-serif',
          }}>
            {isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
            {isEdit ? 'ذخیره تغییرات' : 'ایجاد محصول'}
          </button>
        </div>
      </div>

      {/* File manager modal */}
      {fmOpen && productId && (
        <FileManagerModal
          productId={productId}
          type={fmOpen}
          isOpen={true}
          onClose={() => { setFmOpen(null); queryClient.invalidateQueries({ queryKey: ['product-full', productId] }); }}
        />
      )}
    </div>
  );
}

// Sub-components
const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'none', letterSpacing: '0' }}>{label}</label>
    {children}
  </div>
);

const Bar = ({ current, max }: { current: number; max: number }) => (
  <p style={{ fontSize: '0.75rem', color: current > max ? '#ef4444' : '#475569', margin: '5px 0 0', textAlign: 'left' }}>
    {current}/{max}
  </p>
);

const SeoBar = ({ value, min, max }: { value: string; min: number; max: number }) => {
  const n = value.length;
  const color = n === 0 ? '#475569' : (n >= min && n <= max) ? '#10b981' : '#f59e0b';
  const label = n === 0 ? 'خالی' : (n >= min && n <= max) ? '✓ مناسب' : n < min ? '↑ کوتاه' : '↓ بلند';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: color, width: `${Math.min(100, n > 0 ? (n / max) * 100 : 0)}%`, transition: 'all 0.3s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color, fontWeight: 600, minWidth: 80, textAlign: 'left' }}>{label} ({n})</span>
    </div>
  );
};
