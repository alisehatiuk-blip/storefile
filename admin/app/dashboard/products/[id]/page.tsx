'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Save, ArrowRight, Plus, X, Package, DollarSign, FileText, Search, Image as ImageIcon, ChevronRight, Loader2, ExternalLink, FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import FileManagerModal from '@/components/ui/FileManagerModal';

const RichEditor = dynamic(() => import('@/components/ui/RichEditor'), {
  ssr: false,
  loading: () => <div style={{ height: 240, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '0.875rem' }}>در حال بارگذاری ادیتور...</div>,
});

const TABS = [
  { id: 'basic', label: 'اطلاعات پایه', icon: Package },
  { id: 'pricing', label: 'قیمت و دسته', icon: DollarSign },
  { id: 'content', label: 'محتوا', icon: FileText },
  { id: 'media', label: 'تصاویر و فایل', icon: ImageIcon },
  { id: 'seo', label: 'SEO', icon: Search },
];
type Tab = 'basic' | 'pricing' | 'content' | 'media' | 'seo';

const lbl: React.CSSProperties = { display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: 8 };

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('basic');
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [fmOpen, setFmOpen] = useState<'images' | 'files' | null>(null);

  const [form, setForm] = useState({
    title: '', slug: '', shortDescription: '', fullDescription: '',
    features: [] as string[], price: '', supportPrice: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    demoUrl: '', version: '1.0.0', tags: [] as string[],
    categoryIds: [] as string[], metaTitle: '', metaDescription: '',
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-full', params.id],
    queryFn: async () => { const { data } = await api.get(`/products/${params.id}`); return data.data; },
  });

  const { data: catsData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await api.get('/categories'); return data.data || []; },
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
    mutationFn: async (d: typeof form) => { const { data } = await api.put(`/products/${params.id}`, d); return data; },
    onSuccess: () => {
      toast.success('محصول با موفقیت ذخیره شد');
      queryClient.invalidateQueries({ queryKey: ['product-full', params.id] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'خطا در ذخیره'),
  });

  const addFeature = () => { if (newFeature.trim()) { setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] })); setNewFeature(''); } };
  const addTag = () => { if (newTag.trim()) { setForm(f => ({ ...f, tags: [...f.tags, newTag.trim()] })); setNewTag(''); } };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Link href="/dashboard/products" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.875rem', textDecoration: 'none' }}>
          <ArrowRight style={{ width: 16, height: 16 }} />محصولات
        </Link>
        <ChevronRight style={{ width: 14, height: 14, color: '#334155' }} />
        <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>ویرایش محصول</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package style={{ width: 22, height: 22, color: '#6366f1' }} />
          </div>
          <div>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.25rem', margin: 0 }} className="line-clamp-1">{product?.title}</h1>
            <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>v{form.version}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {product?.slug && (
            <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000'}/products/${product.slug}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: '0.8125rem', textDecoration: 'none', padding: '0.4rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <ExternalLink style={{ width: 14, height: 14 }} />مشاهده
            </a>
          )}
          <select value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))} className="input" style={{ width: 'auto' }}>
            <option value="draft">📝 پیش‌نویس</option>
            <option value="published">✅ منتشر</option>
            <option value="archived">📦 بایگانی</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 4, border: '1px solid rgba(255,255,255,0.06)', gap: 2 }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '0.625rem 0.5rem', borderRadius: 10, fontSize: '0.8125rem', fontWeight: 500,
              background: active ? '#4f46e5' : 'transparent', color: active ? 'white' : '#64748b',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Vazirmatn, sans-serif', whiteSpace: 'nowrap',
            }}>
              <Icon style={{ width: 14, height: 14 }} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="card" style={{ padding: '1.75rem' }}>
        {tab === 'basic' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>عنوان محصول</label><input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} className="input" /></div>
              <div><label style={lbl}>اسلاگ (URL)</label><input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="input" dir="ltr" /></div>
            </div>
            <div>
              <label style={lbl}>توضیح کوتاه</label>
              <textarea value={form.shortDescription} onChange={(e) => setForm(f => ({ ...f, shortDescription: e.target.value }))} rows={3} className="input" style={{ resize: 'none' }} />
              <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: 4 }}>{form.shortDescription.length}/200</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><label style={lbl}>نسخه</label><input value={form.version} onChange={(e) => setForm(f => ({ ...f, version: e.target.value }))} className="input" dir="ltr" /></div>
              <div><label style={lbl}>لینک دمو</label><input value={form.demoUrl} onChange={(e) => setForm(f => ({ ...f, demoUrl: e.target.value }))} className="input" dir="ltr" type="url" /></div>
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={lbl}>قیمت (تومان)</label>
                <input value={form.price} onChange={(e) => setForm(f => ({ ...f, price: e.target.value }))} className="input" dir="ltr" />
              </div>
              <div>
                <label style={lbl}>قیمت پشتیبانی</label>
                <input value={form.supportPrice} onChange={(e) => setForm(f => ({ ...f, supportPrice: e.target.value }))} className="input" dir="ltr" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                {form.price && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p style={{ fontSize: '0.7rem', color: '#6366f1', margin: '0 0 2px', fontWeight: 600 }}>قیمت فعلی</p>
                    <p style={{ color: '#a5b4fc', fontWeight: 700, margin: 0 }}>{(parseInt(form.price) || 0).toLocaleString('fa-IR')} تومان</p>
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
                <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="برچسب..." className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addTag} className="btn-secondary" style={{ padding: '0 1rem' }}><Plus style={{ width: 16, height: 16 }} /></button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {form.tags.map((t, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.3rem 0.7rem', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.8125rem' }}>
                    {t}<button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 0 }}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'content' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={lbl}>توضیحات کامل محصول</label>
              <div style={{ marginTop: 8 }}>
                <RichEditor key={product?.id} value={form.fullDescription} onChange={(v) => setForm(f => ({ ...f, fullDescription: v }))} placeholder="توضیحات کامل محصول..." />
              </div>
            </div>
            <div>
              <label style={lbl}>ویژگی‌های کلیدی</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: 10 }}>
                <input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())} placeholder="ویژگی را وارد کنید..." className="input" style={{ flex: 1 }} />
                <button type="button" onClick={addFeature} className="btn-secondary" style={{ padding: '0 1rem' }}><Plus style={{ width: 16, height: 16 }} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {form.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                    <span style={{ flex: 1, color: '#e2e8f0', fontSize: '0.875rem' }}>{f}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}><X style={{ width: 14, height: 14 }} /></button>
                  </div>
                ))}
                {form.features.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#334155', fontSize: '0.875rem', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.06)' }}>
                    هنوز ویژگی‌ای اضافه نشده
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Images section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 2px' }}>تصاویر محصول</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.images || []).length} تصویر آپلود شده</p>
                </div>
                <button type="button" onClick={() => setFmOpen('images')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 16, height: 16 }} />مدیریت تصاویر
                </button>
              </div>
              {(product?.images || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {(product?.images || []).map((img: any) => (
                    <div key={img.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <img src={img.url} alt={img.altText || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {img.isPrimary && <div style={{ position: 'absolute', bottom: 4, right: 4, background: '#4f46e5', borderRadius: 6, padding: '1px 6px', fontSize: '0.65rem', color: 'white' }}>اصلی</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer' }} onClick={() => setFmOpen('images')}>
                  <ImageIcon style={{ width: 40, height: 40, margin: '0 auto 1rem', color: '#334155' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 4px' }}>هنوز تصویری آپلود نشده</p>
                  <p style={{ color: '#334155', fontSize: '0.8125rem', margin: 0 }}>کلیک کنید تا فایل منیجر باز شود</p>
                </div>
              )}
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

            {/* Files section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ color: 'white', fontWeight: 700, margin: '0 0 2px' }}>فایل‌های دانلود</h3>
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>{(product?.files || []).length} فایل آپلود شده</p>
                </div>
                <button type="button" onClick={() => setFmOpen('files')} className="btn-primary" style={{ fontSize: '0.875rem' }}>
                  <FolderOpen style={{ width: 16, height: 16 }} />مدیریت فایل‌ها
                </button>
              </div>
              {(product?.files || []).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(product?.files || []).map((f: any) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText style={{ width: 18, height: 18, color: '#6366f1' }} />
                      </div>
                      <div>
                        <p style={{ color: 'white', fontWeight: 500, fontSize: '0.9rem', margin: 0 }}>{f.fileName}</p>
                        <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>v{f.version || '1.0.0'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2.5rem', borderRadius: 14, border: '2px dashed rgba(255,255,255,0.08)', cursor: 'pointer' }} onClick={() => setFmOpen('files')}>
                  <FileText style={{ width: 40, height: 40, margin: '0 auto 1rem', color: '#334155' }} />
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 4px' }}>هنوز فایلی آپلود نشده</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <p style={{ color: '#6366f1', fontSize: '0.8125rem', fontWeight: 600, margin: '0 0 4px' }}>راهنمای SEO</p>
              <p style={{ color: '#64748b', fontSize: '0.8125rem', margin: 0 }}>برای بهتر دیده شدن در گوگل، عنوان ۵۰-۶۰ کاراکتر و توضیحات ۱۴۰-۱۶۰ کاراکتر باشد.</p>
            </div>
            <div>
              <label style={lbl}>عنوان متا (Meta Title)</label>
              <input value={form.metaTitle} onChange={(e) => setForm(f => ({ ...f, metaTitle: e.target.value }))} className="input" />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaTitle.length < 50 ? '⚠️ کوتاه' : form.metaTitle.length <= 60 ? '✅ مناسب' : '⚠️ بلند'}</p>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaTitle.length}/60</p>
              </div>
            </div>
            <div>
              <label style={lbl}>توضیحات متا</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm(f => ({ ...f, metaDescription: e.target.value }))} rows={4} className="input" style={{ resize: 'none' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaDescription.length < 140 ? '⚠️ کوتاه' : form.metaDescription.length <= 160 ? '✅ مناسب' : '⚠️ بلند'}</p>
                <p style={{ fontSize: '0.75rem', color: '#334155', margin: 0 }}>{form.metaDescription.length}/160</p>
              </div>
            </div>
            {(form.metaTitle || form.metaDescription) && (
              <div style={{ padding: '1rem 1.25rem', borderRadius: 12, background: '#fff', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.7rem', color: '#1a73e8', margin: '0 0 2px', fontFamily: 'Arial', direction: 'ltr' }}>digiscript.ir › products › {form.slug}</p>
                <p style={{ fontSize: '1.05rem', color: '#1a0dab', margin: '0 0 4px', fontFamily: 'Arial', direction: 'rtl' }}>{form.metaTitle || form.title}</p>
                <p style={{ fontSize: '0.8125rem', color: '#4d5156', margin: 0, fontFamily: 'Arial', direction: 'rtl', lineHeight: 1.5 }}>{form.metaDescription || form.shortDescription}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)} style={{ width: 8, height: 8, borderRadius: '50%', background: tab === t.id ? '#6366f1' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: 0 }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard/products" className="btn-secondary" style={{ fontSize: '0.875rem' }}>انصراف</Link>
          <button type="button" disabled={mutation.isPending} onClick={() => mutation.mutate(form)} className="btn-primary" style={{ fontSize: '0.875rem', opacity: mutation.isPending ? 0.6 : 1 }}>
            {mutation.isPending ? <><Loader2 style={{ width: 16, height: 16, animation: 'spin 0.8s linear infinite' }} />در حال ذخیره...</> : <><Save style={{ width: 16, height: 16 }} />ذخیره تغییرات</>}
          </button>
        </div>
      </div>

      {/* File manager modal */}
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
