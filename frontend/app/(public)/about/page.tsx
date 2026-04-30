import { Metadata } from 'next';
import { Users, Code2, Shield, Zap } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = { title: 'درباره ما' };

const team = [
  { name: 'حسین احمدی', role: 'بنیان‌گذار و مدیرعامل', avatar: 'ح' },
  { name: 'زهرا کریمی', role: 'مدیر محصول', avatar: 'ز' },
  { name: 'رضا موسوی', role: 'معمار نرم‌افزار', avatar: 'ر' },
  { name: 'نازنین صادقی', role: 'طراح UX', avatar: 'ن' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        {/* Hero */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 hero-gradient pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-8">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              از ۱۴۰۲ تاکنون
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
              ما به ابزارهای کسب‌وکار
              <br />
              <span className="gradient-text">ایمان داریم</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed">
              دیجی‌اسکریپت با هدف دسترسی آسان توسعه‌دهندگان و کارآفرینان ایرانی به ابزارهای
              حرفه‌ای کسب‌وکار تأسیس شد.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="py-20 bg-[#0a0a14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">مأموریت ما</h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  ما باور داریم که هر کارآفرین و توسعه‌دهنده‌ای باید به ابزارهای حرفه‌ای دسترسی داشته باشد.
                  بدون نیاز به صرف ماه‌ها وقت برای کد نویسی از صفر.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  محصولات ما توسط توسعه‌دهندگان با تجربه ساخته می‌شوند و برای استقرار فوری آماده هستند.
                  هر محصول با مستندات کامل و پشتیبانی اختصاصی همراه است.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Code2, title: 'کدهای تمیز', desc: 'استانداردهای صنعتی' },
                  { icon: Shield, title: 'امنیت اول', desc: 'تست شده و ایمن' },
                  { icon: Users, title: 'جامعه فعال', desc: 'پشتیبانی از هم' },
                  { icon: Zap, title: 'به‌روزرسانی', desc: 'همیشه به‌روز' },
                ].map((item) => (
                  <div key={item.title} className="card p-5 text-center">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <item.icon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white mb-3">تیم ما</h2>
              <p className="text-slate-400">افرادی که دیجی‌اسکریپت را می‌سازند</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div key={member.name} className="card p-6 text-center hover:border-indigo-500/20 transition-all">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold shadow-lg shadow-indigo-500/20">
                    {member.avatar}
                  </div>
                  <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                  <p className="text-slate-400 text-sm">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
