'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Upload, Trash2, Check, Image as ImageIcon, File, Loader2, FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MediaFile {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface Props {
  productId: string;
  type: 'images' | 'files';
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (file: MediaFile) => void;
  selectedId?: string;
}

export default function FileManagerModal({ productId, type, isOpen, onClose, onSelect, selectedId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<string | null>(selectedId || null);
  const queryClient = useQueryClient();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-media', productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data.data;
    },
    enabled: isOpen && !!productId,
  });

  const files: MediaFile[] = type === 'images' ? (productData?.images || []) : (productData?.files || []);

  const upload = async (fileList: FileList | null) => {
    if (!fileList || !fileList[0] || !productId) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', fileList[0]);
    try {
      const endpoint = type === 'images'
        ? `/uploads/images/product/${productId}`
        : `/uploads/files/product/${productId}`;
      await api.post(endpoint, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      queryClient.invalidateQueries({ queryKey: ['product-media', productId] });
      toast.success('آپلود موفق');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در آپلود');
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const ep = type === 'images' ? `/uploads/images/${id}` : `/uploads/files/${id}`;
      await api.delete(ep);
      queryClient.invalidateQueries({ queryKey: ['product-media', productId] });
      if (selected === id) setSelected(null);
      toast.success('حذف شد');
    } catch { toast.error('خطا در حذف'); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files);
  }, [productId]);

  const handleSelect = (file: MediaFile) => {
    setSelected(file.id);
    onSelect?.(file);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose} />

      {/* Modal */}
      <div style={{
        position: 'relative', width: '100%', maxWidth: 760, maxHeight: '85vh',
        background: '#12121f', borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderOpen style={{ width: 18, height: 18, color: '#6366f1' }} />
            </div>
            <div>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                {type === 'images' ? 'مدیریت تصاویر' : 'مدیریت فایل‌ها'}
              </h3>
              <p style={{ color: '#475569', fontSize: '0.75rem', margin: 0 }}>
                {files.length} {type === 'images' ? 'تصویر' : 'فایل'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>
          {/* Upload zone */}
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('fm-input')?.click()}
            style={{
              border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 14, padding: '1.5rem', textAlign: 'center', cursor: 'pointer',
              background: dragging ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s', marginBottom: '1.25rem',
            }}
          >
            <input id="fm-input" type="file" style={{ display: 'none' }}
              accept={type === 'images' ? 'image/*' : '*'}
              onChange={(e) => upload(e.target.files)}
            />
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Loader2 style={{ width: 28, height: 28, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>در حال آپلود...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload style={{ width: 28, height: 28, color: dragging ? '#6366f1' : '#475569' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
                  فایل را اینجا بکشید یا <span style={{ color: '#6366f1' }}>کلیک کنید</span>
                </p>
                <p style={{ color: '#334155', fontSize: '0.75rem', margin: 0 }}>
                  {type === 'images' ? 'JPG, PNG, WebP — حداکثر ۵MB' : 'ZIP, RAR, PDF — حداکثر ۵۰MB'}
                </p>
              </div>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <Loader2 style={{ width: 24, height: 24, color: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#334155' }}>
              {type === 'images'
                ? <ImageIcon style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
                : <File style={{ width: 48, height: 48, margin: '0 auto 1rem', opacity: 0.3 }} />
              }
              <p style={{ margin: 0, fontSize: '0.875rem' }}>هنوز فایلی آپلود نشده</p>
            </div>
          ) : type === 'images' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
              {files.map((f: any) => (
                <div key={f.id}
                  style={{
                    position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                    border: `2px solid ${selected === f.id ? '#6366f1' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleSelect(f)}
                >
                  <img src={f.url} alt={f.altText || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {selected === f.id && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check style={{ width: 24, height: 24, color: 'white' }} />
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                    style={{ position: 'absolute', top: 6, left: 6, width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: 'white' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    <Trash2 style={{ width: 12, height: 12 }} />
                  </button>
                  {f.isPrimary && (
                    <div style={{ position: 'absolute', bottom: 6, right: 6, background: '#4f46e5', borderRadius: 6, padding: '2px 6px', fontSize: '0.65rem', color: 'white' }}>اصلی</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {files.map((f: any) => (
                <div key={f.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '0.875rem 1rem', borderRadius: 12, cursor: 'pointer',
                    background: selected === f.id ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selected === f.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.2s',
                  }}
                  onClick={() => handleSelect(f)}
                >
                  <File style={{ width: 20, height: 20, color: '#6366f1', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'white', fontSize: '0.875rem', fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.fileName}</p>
                  </div>
                  {selected === f.id && <Check style={{ width: 16, height: 16, color: '#6366f1' }} />}
                  <button onClick={(e) => { e.stopPropagation(); deleteFile(f.id); }}
                    style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
          <p style={{ color: '#475569', fontSize: '0.8125rem', margin: 0 }}>
            {onSelect ? 'روی فایل کلیک کنید تا انتخاب شود' : 'مدیریت فایل‌ها'}
          </p>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>بستن</button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
