'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Image as ImageIcon, File, Check, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ProductFile {
  id: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  isPrimary?: boolean;
  altText?: string;
}

interface Props {
  productId: string;
  type: 'images' | 'files';
  onSelect?: (file: ProductFile) => void;
}

export default function FileManager({ productId, type, onSelect }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}`);
      return data.data;
    },
    enabled: !!productId,
  });

  const files: ProductFile[] = type === 'images'
    ? (productData?.images || [])
    : (productData?.files || []);

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/uploads/${type === 'images' ? 'images' : 'files'}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      toast.success('حذف شد');
    },
    onError: () => toast.error('خطا در حذف'),
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !productId) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const endpoint = type === 'images'
        ? `/uploads/images/product/${productId}`
        : `/uploads/files/product/${productId}`;
      await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] });
      toast.success('فایل با موفقیت آپلود شد');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در آپلود');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [productId]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative rounded-xl p-8 text-center transition-all duration-200 cursor-pointer"
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : 'rgba(255,255,255,0.1)'}`,
          background: dragging ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
        }}
        onClick={() => document.getElementById(`file-input-${type}`)?.click()}
      >
        <input
          id={`file-input-${type}`}
          type="file"
          className="hidden"
          accept={type === 'images' ? 'image/*' : '*'}
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6366f1' }} />
            <p className="text-sm" style={{ color: '#94a3b8' }}>در حال آپلود...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8" style={{ color: dragging ? '#6366f1' : '#475569' }} />
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>
              {type === 'images' ? 'تصویر را اینجا بکشید یا کلیک کنید' : 'فایل را اینجا بکشید یا کلیک کنید'}
            </p>
            <p className="text-xs" style={{ color: '#475569' }}>
              {type === 'images' ? 'JPG, PNG, WebP — حداکثر ۵MB' : 'ZIP, RAR, PDF — حداکثر ۵۰MB'}
            </p>
          </div>
        )}
      </div>

      {/* Files grid */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#6366f1' }} />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-6" style={{ color: '#475569' }}>
          {type === 'images' ? <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-30" /> : <File className="w-10 h-10 mx-auto mb-2 opacity-30" />}
          <p className="text-sm">هنوز {type === 'images' ? 'تصویری' : 'فایلی'} آپلود نشده</p>
        </div>
      ) : type === 'images' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              onClick={() => onSelect?.(file)}
            >
              {file.url && (
                <img src={file.url} alt={file.altText || ''} className="w-full h-full object-cover" />
              )}
              {file.isPrimary && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full text-xs font-medium" style={{ background: '#4f46e5', color: 'white' }}>
                  اصلی
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteImageMutation.mutate(file.id); }}
                  className="p-2 rounded-full transition-all hover:scale-110"
                  style={{ background: 'rgba(239,68,68,0.8)' }}
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <File className="w-5 h-5 flex-shrink-0" style={{ color: '#6366f1' }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.fileName}</p>
                {file.fileSize && <p className="text-xs" style={{ color: '#64748b' }}>{formatFileSize(file.fileSize)}</p>}
              </div>
              <button
                onClick={() => deleteImageMutation.mutate(file.id)}
                className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                style={{ color: '#64748b' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
