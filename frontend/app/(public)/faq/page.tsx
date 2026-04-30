'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

const faqs = [
  {
    q: 'آیا محصولات دارای ضمانت هستند؟',
    a: 'بله، تمام محصولات ما دارای ضمانت ۷ روزه بازگشت وجه هستند. اگر از محصول راضی نبودید، مبلغ کامل برگردانده می‌شود.',
  },
  {
    q: 'آیا پس از خرید می‌توانم محصول را چند بار دانلود کنم؟',
    a: 'بله، شما می‌توانید تا ۳ بار لینک دانلود جداگانه دریافت کنید. هر لینک به مدت ۱ ساعت معتبر است.',
  },
  {
    q: 'آیا به‌روزرسانی‌های آینده رایگان هستند؟',
    a: 'بله، تمام به‌روزرسانی‌های نسخه اصلی محصول برای خریداران رایگان است. خریداران همیشه به آخرین نسخه دسترسی دارند.',
  },
  {
    q: 'آیا می‌توانم از محصول در پروژه‌های تجاری استفاده کنم؟',
    a: 'بله، لایسنس تجاری شامل استفاده در یک پروژه تجاری می‌شود. برای چند پروژه، لایسنس چندگانه در دسترس است.',
  },
  {
    q: 'روش‌های پرداخت چیست؟',
    a: 'در حال حاضر از کارت‌های بانکی ایرانی (درگاه زرین‌پال)، کیف پول دیجیتال و واریز مستقیم پشتیبانی می‌کنیم.',
  },
  {
    q: 'اگر مشکلی داشتم چطور با پشتیبانی تماس بگیرم؟',
    a: 'می‌توانید از سیستم تیکت در داشبورد کاربری استفاده کنید. تیم پشتیبانی در ساعات اداری پاسخگوی شما خواهد بود.',
  },
  {
    q: 'آیا کد منبع محصولات در دسترس است؟',
    a: 'بله، تمام محصولات با کد منبع کامل ارائه می‌شوند. شما می‌توانید کد را بررسی، سفارشی‌سازی و توسعه دهید.',
  },
  {
    q: 'آیا آموزش نصب ارائه می‌شود؟',
    a: 'بله، هر محصول با مستندات کامل نصب و راه‌اندازی همراه است. در صورت نیاز، پشتیبانی نصب هم ارائه می‌شود.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-6 text-right"
      >
        <span className="text-white font-medium">{question}</span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-slate-400 flex-shrink-0 mr-4 transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-black text-white mb-4">سوالات متداول</h1>
            <p className="text-slate-400">پاسخ سوالات رایج درباره خرید، دانلود و پشتیبانی</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>

          <div className="mt-12 card p-8 text-center">
            <h3 className="text-white font-semibold text-lg mb-2">سوالتان اینجا نیست؟</h3>
            <p className="text-slate-400 text-sm mb-6">تیم پشتیبانی ما آماده پاسخگویی است</p>
            <a href="/contact" className="btn-primary">
              تماس با پشتیبانی
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
