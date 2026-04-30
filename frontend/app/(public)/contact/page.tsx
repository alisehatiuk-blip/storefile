'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const contactInfo = [
  { icon: Mail, label: 'ایمیل', value: 'info@digiscript.ir', href: 'mailto:info@digiscript.ir' },
  { icon: Phone, label: 'تلفن', value: '۰۲۱-۱۲۳۴۵۶۷۸', href: 'tel:+982112345678' },
  { icon: MapPin, label: 'آدرس', value: 'تهران، ایران', href: null },
  { icon: Clock, label: 'ساعت پاسخگویی', value: '۹ صبح تا ۶ بعدازظهر', href: null },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-black text-white mb-4">تماس با ما</h1>
            <p className="text-slate-400 text-lg">هر سؤال یا مشکلی دارید، در خدمت شما هستیم</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-4">
              {contactInfo.map((item) => (
                <div key={item.label} className="card p-5 flex items-center gap-4">
                  <div className="w-11 h-11 bg-indigo-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-white hover:text-indigo-400 transition-colors font-medium">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span className="text-white font-medium">تیکت پشتیبانی</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  برای مشکلات فنی یا سوالات مربوط به محصولات، از سیستم تیکت استفاده کنید.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 card p-8">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">پیام ارسال شد!</h3>
                  <p className="text-slate-400">در اسرع وقت پاسخ خواهیم داد.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white mb-6">ارسال پیام</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-slate-300 text-sm font-medium mb-1.5 block">نام</label>
                        <input
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="نام شما"
                          required
                          className="input"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 text-sm font-medium mb-1.5 block">ایمیل</label>
                        <input
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          type="email"
                          placeholder="example@email.com"
                          required
                          className="input"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-1.5 block">موضوع</label>
                      <input
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder="موضوع پیام شما"
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-1.5 block">پیام</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="پیام خود را اینجا بنویسید..."
                        required
                        rows={6}
                        className="input resize-none"
                      />
                    </div>
                    <button type="submit" className="btn-primary py-3.5 px-8">
                      <Send className="w-4 h-4" />
                      ارسال پیام
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
