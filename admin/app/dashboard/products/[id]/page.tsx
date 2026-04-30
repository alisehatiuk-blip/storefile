'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Save, ArrowRight, Plus, X, Package, DollarSign, FileText,
  Search, Image as ImageIcon, ChevronRight, Loader2, ExternalLink,
  FolderOpen, Eye, BarChart2,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import FileManagerModal from '@/components/ui/FileManagerModal';

const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10 }}>
      <Loader2 style={{ width: 24, height: 24, color: '#475569', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ color: '#475569', fontSize: '0.875rem' }}>بارگذاری ادیتور...</span>
    </div>
  ),
});

const TABS = [
  { id: 'basic', label: 'پایه', icon: Package },
  { id: 'pricing', label: 'قیمت', icon: DollarSign },
  { id: 'content', label: 'محتوا', icon: FileText },
  { id: 'media', label: 'رسانه', icon: ImageIcon },
  { id: 'seo', label: 'SEO', icon: Search },
  { id: 'stats', label: 'آمار', icon: BarChart2 },
];
type Tab = 'basic' | 'pricing' | 'content' | 'media' | 'seo' | 'stats';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('basic');
  const [fmOpen, setFmOpen] = useState<'images' | 'files' | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    title: '', slug: '', shortDescription: '', fullDescription: '',
    features: [] as string[], price: '', supportPrice: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    demoUrl: '', version: '1.0.0', tags: [] as string[],
    categoryIds: [] as string[], metaTitle: '', metaDescription: '',
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-full', params.id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${params.id}`);
      return data.data;
    },
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories');
      return data.data || [];
    },
  });

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

  const mutation = useMutation({
    mutationFn: async (d: typeof form) => {
      const { data } = await api.put(`/products/${params.id}`, d);
      return data;
    },
    onSuccess: () => {
      toast.success('محصول ذخیره شد');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['product-full', params.id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ذخیره'),
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

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
      <Loader2 style={{ width: 40, height: 40, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const statusColors: Record<string, string> = {
    published: '#10b981', draft: '#f59e0b', archived: '#64748b',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: tab === 'content' ? '100%' : 900 }}>
      {/* Breadcrumb + Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
          <Link href="/dashboard/products" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8125rem', textDecoration: 'none' }}>
            <ArrowRight style={{ width: 14, height: 14 }} />محصولات
          </Link>
          <ChevronRight style={{ width: 12, height: 12, color: '#334155' }} />
          <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>ویرایش</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {product?.images?.[0]?.url ? (
              <img src={product.images[0].url} alt="" style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', border: '2px solid rgba(255,255,255,0.08)' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package style={{ width: 24, height: 24, color: '#6366f1' }} />
              </div>
            )}
            <div>
              <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', margin: '0 0 4px' }}>{product?.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 20, background: `${statusColors[form.status]}18`, color: statusColors[form.status], border: `1px solid ${statusColors[form.status]}30` }}>
                  {form.status === 'published' ? 'منتشر' : form.status === 'draft' ? 'پیش‌نویس' : 'بایگانی'}
                </span>
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>v{form.version}</span>
                <span style={{ color: '#475569', fontSize: '0.75rem' }}>{product?.downloadCount || 0} دانلود</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))} className="input" style={{ width: 'auto', fontSize: '0.875rem', padding: '6px 12px' }}>
              <option value="draft">📝 پیش‌نویس</option>
              <option value="published">✅ منتشر</option>
              <option value="archived">📦 بایگانی</option>
            </select>
            {product?.slug && (
              <a href={`http://localhost:3000/products/${product.slug}`} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, color: '#94a3b8', fontSize: '0.8125rem', textDecoration: 'none' }}>
                <Eye style={{ width: 14, height: 14 }} />پیش‌نمایش
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', gap: 2, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 6,
              padding: '0.5rem 0.875rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500,
              background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#64748b',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Vazirmatn, sans-serif',
            }}>
              <Icon style={{ width: 14, height: 14 }} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: tab === 'content' ? '1.5rem' : '1.75rem' }}>
        {/* BASIC */}
        {tab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Row>
              <Field label="عنوان محصول *">
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" />
              </Field>
              <Field label="اسلاگ URL *">
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" />
              </Field>
            </Row>
            <Field label="توضیح کوتاه *">
              <textarea value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={3} className="input" style={{ resize: 'none' }} />
              <Counter current={form.shortDescription.length} max={200} />
            </Field>
            <Row>
              <Field label="نسخه">
                <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} className="input" dir="ltr" />
              </Field>
              <Field label="لینک دمو">
                <input value={form.demoUrl} onChange={e => setForm(f => ({ ...f, demoUrl: e.target.value }))} className="input" dir="ltr" type="url" placeholder="https://" />
              </Field>
            </Row>
          </div>
        )}

        {/* PRICING */}
        {tab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Field label="قیمت (تومان) *">
                <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="input" dir="ltr" placeholder="490000" />
              </Field>
              <Field label="قیمت پشتیبانی سالانه">
                <input value={form.supportPrice} onChange={e => setForm(f => ({ ...f, supportPrice: e.target.value }))} className="input" dir="ltr" placeholder="150000" />
              </Field>
              <div>
                <label style={lbl}>&nbsp;</label>
                {form.price && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', marginTop: 2 }}>
                    <p style={{ fontSize: '0.7rem', color: '#6366f1', margin: '0 0 2px', fontWeight: 700 }}>مجموع با پشتیبانی</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 800, margin: 0, fontSize: '1rem' }}>
                      {(+(form.price || 0) + +(form.supportPrice || 0)).toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                )}
              </div>
            </div>
            <Field label="دسته‌بندی‌ها">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {(catsData || []).map((cat: any) => {
                  const sel = form.categoryIds.includes(cat.id);
                  return (
                    <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, categoryIds: sel ? f.categoryIds.filter(id => id !== cat.id) : [...f.categoryIds, cat.id] }))}
                      style={{ padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', background: sel ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: sel ? '#a5b4fc' : '#94a3b8', border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.15s' }}>
                      {sel && '✓ '}{cat.name}
                    </button>
                  );
                })}
              </div>
            </Field>
            <Field label="برچسب‌ها">
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="برچسب + Enter" className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addTag} className="btn-primary" style={{ padding: '0 14px', flexShrink: 0 }}><Plus style={{ width: 16, height: 16 }} /></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.tags.map((t, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.3rem 0.75rem', borderRadius: 20, background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8125rem' }}>
                    {t}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0, lineHeight: 1, fontSize: '1rem' }}>×</button>
                  </span>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* CONTENT — FULL WIDTH EDITOR */}
        {tab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Field label="توضیحات کامل محصول">
              <div style={{ marginTop: 8 }}>
                <RichEditor
                  key={`editor-${product?.id}`}
                  value={form.fullDescription}
                  onChange={v => setForm(f => ({ ...f, fullDescription: v }))}
                  minHeight={500}
                  placeholder="محتوای کامل محصول را اینجا بنویسید..."
                  onImageInsert={() => setFmOpen('images')}
                />
              </div>
            </Field>
            <Field label="ویژگی‌های کلیدی">
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="ویژگی + Enter" className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addFeature} className="btn-primary" style={{ padding: '0 14px', flexShrink: 0 }}><Plus style={{ width: 16, height: 16 }} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.9rem' }}>{feat}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}>
                      <X style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
                {form.features.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#334155', fontSize: '0.875rem', borderRadius: 10, border: '1px dashed rgba(255,255,255,0.06)' }}>
                    هنوز ویژگی‌ای اضافه نشده
                  </div>
                )}
              </div>
            </Field>
          </div>
        )}

        {/* MEDIA */}
        {tab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Images */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 2px' }}>تصاویر محصول</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.images || []).length} تصویر</p>
                </div>
                <button type="button" onClick={() => setFmOpen('images')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 16, height: 16 }} />باز کردن فایل منیجر
                </button>
              </div>
              {(product?.images || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                  {(product?.images || []).map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.isPrimary && <div style={{ position: 'absolute', bottom: 5, right: 5, background: 'rgba(79,70,229,0.9)', borderRadius: 6, padding: '1px 6px', fontSize: '0.65rem', color: 'white', backdropFilter: 'blur(4px)' }}>اصلی</div>}
                    </div>
                  ))}
                  <div onClick={() => setFmOpen('images')} style={{ aspectRatio: '1', borderRadius: 12, border: '2px dashed rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'rgba(99,102,241,0.04)', color: '#6366f1' }}>
                    <Plus style={{ width: 24, height: 24 }} />
                  </div>
                </div>
              ) : (
                <div onClick={() => setFmOpen('images')} style={{ textAlign: 'center', padding: '3rem', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <ImageIcon style={{ width: 40, height: 40, margin: '0 auto 12px', color: '#334155' }} />
                  <p style={{ color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>هنوز تصویری نیست</p>
                  <p style={{ color: '#334155', fontSize: '0.8125rem', margin: 0 }}>کلیک کنید تا فایل منیجر باز شود</p>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: 0 }} />

            {/* Files */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 2px' }}>فایل‌های دانلود</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.files || []).length} فایل</p>
                </div>
                <button type="button" onClick={() => setFmOpen('files')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 16, height: 16 }} />باز کردن فایل منیجر
                </button>
              </div>
              {(product?.files || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(product?.files || []).map((f: any) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.875rem 1.125rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText style={{ width: 18, height: 18, color: '#6366f1' }} />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>{f.fileName}</p>
                        <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>نسخه {f.version || '1.0.0'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div onClick={() => setFmOpen('files')} style={{ textAlign: 'center', padding: '3rem', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <FileText style={{ width: 40, height: 40, margin: '0 auto 12px', color: '#334155' }} />
                  <p style={{ color: '#64748b', margin: '0 0 4px', fontWeight: 600 }}>هنوز فایلی آپلود نشده</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO */}
        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.8125rem', margin: '0 0 4px' }}>راهنمای SEO</p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>عنوان ۵۰-۶۰ کاراکتر و توضیحات ۱۴۰-۱۶۰ کاراکتر بهترین نتیجه را می‌دهد.</p>
            </div>
            <Field label="عنوان متا (Meta Title)">
              <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" placeholder={form.title} />
              <SeoIndicator value={form.metaTitle} min={50} max={60} />
            </Field>
            <Field label="توضیحات متا (Meta Description)">
              <textarea value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={4} className="input" style={{ resize: 'none' }} placeholder={form.shortDescription} />
              <SeoIndicator value={form.metaDescription} min={140} max={160} />
            </Field>

            {/* Google Preview */}
            {(form.metaTitle || form.metaDescription || form.title) && (
              <div>
                <label style={lbl}>پیش‌نمایش گوگل</label>
                <div style={{ padding: '1.25rem', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb', marginTop: 8 }}>
                  <p style={{ fontSize: '0.75rem', color: '#5f6368', margin: '0 0 2px', fontFamily: 'Arial', direction: 'ltr' }}>
                    digiscript.ir › products › {form.slug || 'product'}
                  </p>
                  <p style={{ fontSize: '1.125rem', color: '#1a0dab', margin: '0 0 4px', fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.3 }}>
                    {form.metaTitle || form.title}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: '#4d5156', margin: 0, fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.5 }}>
                    {form.metaDescription || form.shortDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATS */}
        {tab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'تعداد دانلود', value: product?.downloadCount || 0, icon: '⬇️' },
              { label: 'بازدید', value: product?.viewCount || 0, icon: '👁️' },
              { label: 'امتیاز', value: parseFloat(product?.rating || '0').toFixed(1), icon: '⭐' },
              { label: 'تعداد نظرات', value: product?.ratingCount || 0, icon: '💬' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{s.icon}</div>
                <p style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem', margin: '0 0 4px' }}>{s.value.toLocaleString?.('fa-IR') || s.value}</p>
                <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 14, background: saved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${saved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.3s' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{ width: 8, height: 8, borderRadius: '50%', background: tab === t.id ? '#6366f1' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {saved && <span style={{ color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>✓ ذخیره شد</span>}
          <Link href="/dashboard/products" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none', fontFamily: 'Vazirmatn, sans-serif' }}>بازگشت</Link>
          <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(form)}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 20px', background: mutation.isPending ? 'rgba(79,70,229,0.5)' : '#4f46e5', color: 'white', border: 'none', borderRadius: 10, fontSize: '0.875rem', fontWeight: 600, cursor: mutation.isPending ? 'not-allowed' : 'pointer', fontFamily: 'Vazirmatn, sans-serif', transition: 'background 0.2s' }}>
            {mutation.isPending ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} /> : <Save style={{ width: 16, height: 16 }} />}
            ذخیره تغییرات
          </button>
        </div>
      </div>

      {/* File Manager Modal */}
      {fmOpen && (
        <FileManagerModal
          productId={params.id}
          type={fmOpen}
          isOpen={true}
          onClose={() => { setFmOpen(null); queryClient.invalidateQueries({ queryKey: ['product-full', params.id] }); }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Helper components
const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>{children}</div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={lbl}>{label}</label>
    {children}
  </div>
);

const Counter = ({ current, max }: { current: number; max: number }) => (
  <p style={{ fontSize: '0.75rem', color: current > max ? '#ef4444' : '#334155', margin: '4px 0 0', textAlign: 'left' }}>{current}/{max}</p>
);

const SeoIndicator = ({ value, min, max }: { value: string; min: number; max: number }) => {
  const len = value.length;
  const good = len >= min && len <= max;
  const color = len === 0 ? '#475569' : good ? '#10b981' : '#f59e0b';
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
        <div style={{ height: '100%', borderRadius: 2, background: color, width: `${Math.min(100, (len / max) * 100)}%`, transition: 'width 0.2s, background 0.2s' }} />
      </div>
      <span style={{ fontSize: '0.75rem', color, marginRight: 8, flexShrink: 0 }}>
        {len === 0 ? 'خالی' : good ? '✓ مناسب' : len < min ? '↑ کوتاه' : '↓ بلند'} ({len})
      </span>
    </div>
  );
};

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 };
// Re-import for the File icon
function FileText(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.style?.width || 20} height={props.style?.height || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={props.style}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
