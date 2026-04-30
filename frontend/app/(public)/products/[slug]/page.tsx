import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'جزئیات محصول',
};

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <ProductDetailClient slug={params.slug} />
      </main>
      <Footer />
    </>
  );
}
