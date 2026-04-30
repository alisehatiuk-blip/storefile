'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Upload, Trash2, Check, Image as ImageIcon, File, Loader2,
  FolderOpen, Grid, List, Search, Download, Eye, Copy, CheckCheck,
  ZoomIn, ChevronRight,
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MediaFile {
  id: string;
  url?: string;
  fileName?: string;
  altText?: string;
  fileSize?: number;
  isPrimary?: boolean;
  createdAt?: string;
}

interface Props {
  productId: string;
  type: 'images' | 'files';
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
}

export default function FileManagerModal({ productId, type, isOpen, onClose, onSelect }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-fm', productId, type],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data.data;
    },
    enabled: isOpen && !!productId,
  });

  const rawFiles: MediaFile[] = type === 'images' ? (productData?.images || []) : (productData?.files || []);
  const files = rawFiles.filter(f => {
    if (!searchQuery) return true;
    const name = (f.fileName || f.altText || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const upload = async (fileList: FileList | null) => {
    if (!fileList || !productId) return;
    const arr = Array.from(fileList);
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < arr.length; i++) {
      const fd = new FormData();
      fd.append('file', arr[i]);
      try {
        const ep = type === 'images' ? `/uploads/images/product/${productId}` : `/uploads/files/product/${productId}`;
        await api.post(ep, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        setUploadProgress(Math.round(((i + 1) / arr.length) * 100));
      } catch (e: any) {
        toast.error(`خطا در آپلود ${arr[i].name}`);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['product-fm', productId, type] });
    queryClient.invalidateQueries({ queryKey: ['product-full', productId] });
    toast.success(`${arr.length} فایل آپلود شد`);
    setUploading(false);
    setUploadProgress(0);
  };

  const deleteFile = async (id: string) => {
    if (!confirm('آیا مطمئنید؟')) return;
    try {
      await api.delete(`/uploads/${type === 'images' ? 'images' : 'files'}/${id}`);
      queryClient.invalidateQueries({ queryKey: ['product-fm', productId, type] });
      queryClient.invalidateQueries({ queryKey: ['product-full', productId] });
      if (selected === id) setSelected(null);
      if (preview?.id === id) setPreview(null);
      toast.success('حذف شد');
    } catch { toast.error('خطا در حذف'); }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('آدرس کپی شد');
  };

  const handleSelect = (file: MediaFile) => {
    setSelected(file.id);
    onSelect?.(file);
    toast.success('فایل انتخاب شد');
    onClose();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files);
  }, [productId]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }} onClick={onClose} />

      <div style={{
        position: 'relative', width: '100%', maxWidth: preview ? 1000 : 780,
        maxHeight: '90vh', background: '#12121f', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transition: 'max-width 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen style={{ width: 18, height: 18, color: '#6366f1' }} />
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, margin: 0, fontSize: '1rem' }}>
                {type === 'images' ? 'مدیریت تصاویر' : 'مدیریت فایل‌ها'}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{files.length} مورد</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button type="button" onClick={() => setViewMode('grid')} title="نمایش شبکه"
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'grid' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: viewMode === 'grid' ? '#a5b4fc' : '#64748b' }}>
              <Grid style={{ width: 14, height: 14 }} />
            </button>
            <button type="button" onClick={() => setViewMode('list')} title="نمایش لیست"
              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === 'list' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: viewMode === 'list' ? '#a5b4fc' : '#64748b' }}>
              <List style={{ width: 14, height: 14 }} />
            </button>
            <button type="button" onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#64748b' }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو در فایل‌ها..." style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9, padding: '6px 32px 6px 10px', color: 'white', fontSize: '0.8125rem', fontFamily: 'Vazirmatn, sans-serif', outline: 'none' }} />
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 9, fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif', flexShrink: 0 }}>
            <Upload style={{ width: 14, height: 14 }} />
            آپلود
          </button>
          <input ref={inputRef} type="file" style={{ display: 'none' }} accept={type === 'images' ? 'image/*' : '*'} multiple onChange={e => upload(e.target.files)} />
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Files area */}
          <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
            {/* Upload zone */}
            <div onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={e => e.preventDefault()} onDrop={handleDrop} onClick={() => !uploading && inputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, padding: '1rem', textAlign: 'center', cursor: 'pointer', marginBottom: '1rem', background: dragging ? 'rgba(99,102,241,0.06)' : 'transparent', transition: 'all 0.2s' }}>
              {uploading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Loader2 style={{ width: 22, height: 22, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
                  <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <div style={{ height: '100%', background: '#6366f1', borderRadius: 2, transition: 'width 0.3s', width: `${uploadProgress}%` }} />
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem', margin: 0 }}>در حال آپلود... {uploadProgress}%</p>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Upload style={{ width: 18, height: 18, color: '#475569' }} />
                  <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>
                    فایل بکشید یا <span style={{ color: '#6366f1' }}>کلیک کنید</span> — {type === 'images' ? 'JPG/PNG/WebP تا ۵MB' : 'هر فرمتی تا ۵۰MB'}
                  </p>
                </div>
              )}
            </div>

            {/* Grid */}
            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <Loader2 style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : files.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#334155' }}>
                {type === 'images' ? <ImageIcon style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.2 }} /> : <File style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.2 }} />}
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{searchQuery ? 'نتیجه‌ای یافت نشد' : 'هنوز فایلی وجود ندارد'}</p>
              </div>
            ) : viewMode === 'grid' && type === 'images' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {files.map(f => (
                  <div key={f.id}
                    style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${selected === f.id ? '#6366f1' : preview?.id === f.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, transition: 'border-color 0.2s', background: 'rgba(255,255,255,0.03)' }}
                    onClick={() => setPreview(f)}
                  >
                    {f.url && <img src={f.url} alt={f.altText || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    {/* Overlay actions */}
                    <div className="fm-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.2s', opacity: 0 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.6)'; (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'; (e.currentTarget as HTMLElement).style.opacity = '0'; }}>
                      <button type="button" onClick={e => { e.stopPropagation(); handleSelect(f); }} title="انتخاب"
                        style={{ width: 30, height: 30, borderRadius: 8, background: '#4f46e5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Check style={{ width: 14, height: 14 }} />
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); deleteFile(f.id); }} title="حذف"
                        style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.8)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                    {f.isPrimary && <div style={{ position: 'absolute', top: 5, right: 5, background: '#4f46e5', borderRadius: 5, padding: '1px 5px', fontSize: '0.6rem', color: 'white', fontWeight: 600 }}>اصلی</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {files.map(f => (
                  <div key={f.id} onClick={() => type === 'images' ? setPreview(f) : undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.75rem 1rem', borderRadius: 10, cursor: 'pointer', background: selected === f.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${selected === f.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.15s' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {type === 'images' && f.url ? <img src={f.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <File style={{ width: 16, height: 16, color: '#6366f1' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName || f.altText || f.id.slice(0, 8)}</p>
                      {f.fileSize && <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>{formatSize(f.fileSize)}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {type === 'images' && f.url && (
                        <button type="button" onClick={e => { e.stopPropagation(); copyUrl(f.url!, f.id); }} style={{ width: 28, height: 28, borderRadius: 7, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          {copied === f.id ? <CheckCheck style={{ width: 13, height: 13, color: '#10b981' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                        </button>
                      )}
                      <button type="button" onClick={e => { e.stopPropagation(); handleSelect(f); }} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(99,102,241,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                        <Check style={{ width: 13, height: 13 }} />
                      </button>
                      <button type="button" onClick={e => { e.stopPropagation(); deleteFile(f.id); }} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Preview panel */}
          {preview && type === 'images' && (
            <div style={{ width: 220, borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, overflowY: 'auto' }}>
              <div style={{ aspectRatio: '1', borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img src={preview.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '0 0 4px' }}>نام فایل</p>
                <p style={{ color: 'white', fontSize: '0.8125rem', margin: 0, wordBreak: 'break-all' }}>{preview.altText || preview.id.slice(0, 12) + '...'}</p>
              </div>
              {preview.url && (
                <div>
                  <p style={{ color: '#64748b', fontSize: '0.7rem', margin: '0 0 4px' }}>آدرس</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button type="button" onClick={() => copyUrl(preview.url!, preview.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'Vazirmatn, sans-serif' }}>
                      {copied === preview.id ? <CheckCheck style={{ width: 12, height: 12, color: '#10b981' }} /> : <Copy style={{ width: 12, height: 12 }} />}کپی
                    </button>
                    <a href={preview.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, color: '#94a3b8' }}>
                      <ExternalLink style={{ width: 12, height: 12 }} />
                    </a>
                  </div>
                </div>
              )}
              <button type="button" onClick={() => handleSelect(preview)} style={{ width: '100%', padding: '8px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: 9, fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>
                انتخاب این تصویر
              </button>
              <button type="button" onClick={() => deleteFile(preview.id)} style={{ width: '100%', padding: '7px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9, fontSize: '0.8125rem', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>
                حذف فایل
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>
            {selected ? '✅ انتخاب شده' : onSelect ? 'برای انتخاب روی ✓ کلیک کنید' : 'مدیریت فایل‌ها'}
          </p>
          <button type="button" onClick={onClose} style={{ padding: '6px 16px', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' }}>
            بستن
          </button>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .fm-overlay { opacity: 0 !important; }
        .fm-overlay:hover { opacity: 1 !important; background: rgba(0,0,0,0.6) !important; }
      `}</style>
    </div>
  );
}
