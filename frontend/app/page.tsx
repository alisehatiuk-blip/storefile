import Link from 'next/link';
import { ArrowLeft, CheckCircle, Zap, Shield, Code2, TrendingUp, Users, Star, ChevronLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const features = [
  {
    icon: Code2,
    title: 'کدهای آماده',
    description: 'صدها اسکریپت و ابزار آماده برای استقرار فوری در پروژه‌های شما',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Shield,
    title: 'لایسنس امن',
    description: 'سیستم مدیریت لایسنس هوشمند با دانلود امن و محدود شده',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Zap,
    title: 'نصب سریع',
    description: 'مستندات کامل و پشتیبانی تخصصی برای راه‌اندازی سریع',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: TrendingUp,
    title: 'به‌روزرسانی مداوم',
    description: 'محصولات به طور مداوم به‌روز می‌شوند و با خرید دسترسی دائمی دارید',
    color: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { value: '۵۰۰+', label: 'محصول' },
  { value: '۱۲هزار+', label: 'کاربر' },
  { value: '۹۸٪', label: 'رضایت' },
  { value: '۲۴/۷', label: 'پشتیبانی' },
];

const categories = [
  { name: 'اسکریپت‌ها', slug: 'scripts', icon: '⚡', count: '۱۲۰+' },
  { name: 'میکرو SaaS', slug: 'micro-saas', icon: '🚀', count: '۸۵+' },
  { name: 'اتوماسیون', slug: 'automation', icon: '🤖', count: '۶۴+' },
  { name: 'راهکار کسب‌وکار', slug: 'business-solutions', icon: '💼', count: '۵۲+' },
  { name: 'توسعه وب', slug: 'web-development', icon: '🌐', count: '۹۸+' },
];

const testimonials = [
  {
    name: 'علیرضا محمدی',
    role: 'بنیان‌گذار استارتاپ',
    content: 'با استفاده از ربات تلگرام فروشگاه، فروش ما ۳ برابر شد. نصب آسان و پشتیبانی عالی.',
    rating: 5,
  },
  {
    name: 'سارا احمدی',
    role: 'مدیر بازاریابی',
    content: 'سیستم ارسال ایمیل انبوه واقعاً کامل بود. در عرض ۳۰ دقیقه راه‌اندازی کردم.',
    rating: 5,
  },
  {
    name: 'مهدی کریمی',
    role: 'توسعه‌دهنده',
    content: 'کیفیت کدها واقعاً حرفه‌ایه. مستندات کامل و کد تمیز. ارزش هر ریالش رو داره.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
              بیش از ۵۰۰ محصول دیجیتال آماده استفاده
            </div>

            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
              رشد کسب‌وکار
              <br />
              با <span className="gradient-text">کدهای حرفه‌ای</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              اسکریپت‌ها، ابزارهای SaaS و راهکارهای آماده برای تسریع رشد کسب‌وکار شما.
              یک بار بخرید، برای همیشه استفاده کنید.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/products" className="btn-primary text-base px-8 py-4 shadow-xl shadow-indigo-500/25">
                مشاهده محصولات
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link href="/about" className="btn-secondary text-base px-8 py-4">
                بیشتر بدانید
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              {['دانلود امن', 'لایسنس معتبر', 'پشتیبانی ۲۴/۷', 'ضمانت بازگشت وجه'].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-600 animate-bounce">
            <div className="w-5 h-8 rounded-full border-2 border-slate-700 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-slate-600 rounded-full animate-pulse" />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-white/[0.04] bg-[#0a0a14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-4xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title mb-4">دسته‌بندی محصولات</h2>
              <p className="text-slate-400">محصولات را بر اساس نیاز خود پیدا کنید</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categories/${cat.slug}`}
                  className="card-hover p-6 text-center group"
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-slate-500 text-xs">{cat.count} محصول</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-[#0a0a14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title mb-4">چرا دیجی‌اسکریپت؟</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                ما تنها یک فروشگاه ساده نیستیم. ما یک پلتفرم کامل برای رشد کسب‌وکار شما هستیم.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="card p-6 hover:border-white/[0.1] transition-all duration-300 group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="section-title mb-4">نظرات مشتریان</h2>
              <p className="text-slate-400">آنچه مشتریان ما می‌گویند</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <div key={i} className="card p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">{t.name}</div>
                      <div className="text-slate-500 text-xs">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[#0a0a14]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="card p-12 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-sky-500/10" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  آماده شروع هستید؟
                </h2>
                <p className="text-slate-400 text-lg mb-8">
                  همین حالا ثبت‌نام کنید و به بیش از ۵۰۰ محصول دیجیتال دسترسی داشته باشید.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register" className="btn-primary text-base px-8 py-4">
                    شروع رایگان
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                  <Link href="/products" className="btn-secondary text-base px-8 py-4">
                    مشاهده محصولات
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
