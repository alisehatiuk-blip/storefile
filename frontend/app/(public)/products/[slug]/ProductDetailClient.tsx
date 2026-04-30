'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Download, Eye, ExternalLink, CheckCircle, Package,
  Tag, ChevronLeft, ShoppingCart, Headphones, Shield
} from 'lucide-react';
import api from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';
import { Product } from '@/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [includesSupport, setIncludesSupport] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data.data as Product;
    },
  });

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setPurchasing(true);
    try {
      const { data: orderData } = await api.post('/orders', {
        items: [{ productId: data!.id, includesSupport }],
      });
      router.push(`/dashboard/orders/${orderData.data.id}`);
    } catch (error: any) {
      alert(error?.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-24 px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">محصول یافت نشد</h2>
        <Link href="/products" className="btn-primary mt-6">
          بازگشت به محصولات
        </Link>
      </div>
    );
  }

  const totalPrice =
    parseFloat(data.price) + (includesSupport && data.supportPrice ? parseFloat(data.supportPrice) : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">خانه</Link>
        <ChevronLeft className="w-4 h-4" />
        <Link href="/products" className="hover:text-white transition-colors">محصولات</Link>
        {data.categories?.[0] && (
          <>
            <ChevronLeft className="w-4 h-4" />
            <Link href={`/categories/${data.categories[0].slug}`} className="hover:text-white transition-colors">
              {data.categories[0].name}
            </Link>
          </>
        )}
        <ChevronLeft className="w-4 h-4" />
        <span className="text-slate-300 line-clamp-1">{data.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          {data.images && data.images.length > 0 && (
            <div className="card overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-indigo-900/20 to-slate-900/20">
                <Image
                  src={data.images[selectedImage]?.url || '/placeholder.jpg'}
                  alt={data.title}
                  fill
                  className="object-cover"
                />
              </div>
              {data.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {data.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === i ? 'border-indigo-500' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <Image src={img.url} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Product info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {data.categories?.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="badge bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                >
                  {cat.name}
                </Link>
              ))}
              <span className="badge bg-white/5 text-slate-400">v{data.version}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{data.title}</h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
              <div className="flex items-center gap-1.5">
                <Download className="w-4 h-4" />
                <span>{data.downloadCount.toLocaleString('fa-IR')} دانلود</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{data.viewCount.toLocaleString('fa-IR')} بازدید</span>
              </div>
              {parseFloat(data.rating || '0') > 0 && (
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span className="text-yellow-400">{parseFloat(data.rating || '0').toFixed(1)}</span>
                  <span className="text-slate-400">({data.ratingCount} نظر)</span>
                </div>
              )}
              <span>آخرین به‌روزرسانی: {formatDate(data.updatedAt)}</span>
            </div>

            <p className="text-slate-300 text-lg leading-relaxed">{data.shortDescription}</p>

            {data.demoUrl && (
              <a
                href={data.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                مشاهده دمو
              </a>
            )}
          </div>

          {/* Features */}
          {data.features && data.features.length > 0 && (
            <div className="card p-6">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                ویژگی‌ها
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full flex-shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full description */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-5">توضیحات کامل</h2>
            <div
              className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: data.fullDescription }}
            />
          </div>

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              {data.tags.map((tag) => (
                <span key={tag} className="badge bg-white/5 text-slate-400 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Purchase */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Price card */}
            <div className="card p-6">
              <div className="text-3xl font-black text-white mb-1">
                {formatPrice(parseFloat(data.price))}
              </div>
              <p className="text-slate-500 text-sm mb-6">دسترسی دائمی + به‌روزرسانی‌ها</p>

              {/* Support option */}
              {data.supportPrice && parseFloat(data.supportPrice) > 0 && (
                <div
                  className={`border rounded-xl p-4 mb-4 cursor-pointer transition-all ${
                    includesSupport
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setIncludesSupport(!includesSupport)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-indigo-400" />
                      <span className="text-white text-sm font-medium">پشتیبانی یک‌ساله</span>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      includesSupport ? 'border-indigo-500 bg-indigo-500' : 'border-slate-600'
                    }`}>
                      {includesSupport && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs">+ {formatPrice(parseFloat(data.supportPrice))}</p>
                </div>
              )}

              {/* Total */}
              {includesSupport && data.supportPrice && (
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl mb-4">
                  <span className="text-slate-400 text-sm">مجموع</span>
                  <span className="text-white font-bold">{formatPrice(totalPrice)}</span>
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    خرید محصول
                  </>
                )}
              </button>

              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  ضمانت ۷ روزه بازگشت وجه
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  دانلود امن با لینک اختصاصی
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-3.5 h-3.5 text-indigo-400" />
                  به‌روزرسانی‌های رایگان
                </div>
              </div>
            </div>

            {/* Product details */}
            <div className="card p-5">
              <h3 className="text-white font-semibold mb-4">جزئیات محصول</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">نسخه</span>
                  <span className="text-white">{data.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">تاریخ انتشار</span>
                  <span className="text-white">{formatDate(data.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">دانلودها</span>
                  <span className="text-white">{data.downloadCount.toLocaleString('fa-IR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
