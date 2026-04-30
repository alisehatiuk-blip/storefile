'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Download, Eye, Tag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];

  return (
    <Link href={`/products/${product.slug}`}>
      <div className={cn('card-hover group cursor-pointer', className)}>
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-indigo-900/30 to-slate-900/30">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Tag className="w-8 h-8 text-indigo-400" />
              </div>
            </div>
          )}

          {/* Version badge */}
          <div className="absolute top-3 left-3">
            <span className="badge bg-black/60 backdrop-blur-sm text-slate-300 border border-white/10">
              v{product.version}
            </span>
          </div>

          {/* Category badge */}
          {product.categories?.[0] && (
            <div className="absolute top-3 right-3">
              <span className="badge bg-indigo-500/80 backdrop-blur-sm text-white">
                {product.categories[0].name}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-white font-semibold text-lg leading-tight mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {product.shortDescription}
          </p>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge bg-slate-800 text-slate-400 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>{product.downloadCount.toLocaleString('fa-IR')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{product.viewCount.toLocaleString('fa-IR')}</span>
            </div>
            {parseFloat(product.rating || '0') > 0 && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span>{parseFloat(product.rating || '0').toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-white">
                {formatPrice(parseFloat(product.price))}
              </div>
              {product.supportPrice && parseFloat(product.supportPrice) > 0 && (
                <div className="text-xs text-slate-500 mt-0.5">
                  + {formatPrice(parseFloat(product.supportPrice))} پشتیبانی
                </div>
              )}
            </div>
            <div className="btn-primary text-sm py-2 px-4">
              مشاهده
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
