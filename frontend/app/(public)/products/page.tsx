import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductsListClient from './ProductsListClient';

export const metadata: Metadata = {
  title: 'محصولات',
  description: 'مشاهده تمام اسکریپت‌ها، ابزارهای SaaS و راهکارهای کسب‌وکار',
};

export default function ProductsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">محصولات</h1>
            <p className="text-slate-400">مجموعه کاملی از اسکریپت‌ها و ابزارهای دیجیتال</p>
          </div>
          <ProductsListClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
