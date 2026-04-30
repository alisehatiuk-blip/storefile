import Link from 'next/link';
import { Code2, Mail, Phone, MapPin, Share2, ExternalLink, GitBranch } from 'lucide-react';

const footerLinks = {
  products: [
    { name: 'اسکریپت‌ها', href: '/categories/scripts' },
    { name: 'میکرو SaaS', href: '/categories/micro-saas' },
    { name: 'اتوماسیون', href: '/categories/automation' },
    { name: 'راهکارهای کسب‌وکار', href: '/categories/business-solutions' },
  ],
  company: [
    { name: 'درباره ما', href: '/about' },
    { name: 'تماس با ما', href: '/contact' },
    { name: 'سوالات متداول', href: '/faq' },
    { name: 'وبلاگ', href: '/blog' },
  ],
  support: [
    { name: 'مرکز پشتیبانی', href: '/dashboard/tickets/new' },
    { name: 'گارانتی', href: '/guarantee' },
    { name: 'سیاست بازگشت وجه', href: '/refund-policy' },
    { name: 'شرایط استفاده', href: '/terms' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0a0a14] border-t border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                دیجی<span className="text-indigo-400">اسکریپت</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-7 mb-6 max-w-xs">
              فروشگاه تخصصی اسکریپت‌های حرفه‌ای، ابزارهای SaaS و راهکارهای کسب‌وکار. 
              کدهای آماده برای رشد کسب‌وکار شما.
            </p>
            <div className="space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>info@digiscript.ir</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>تهران، ایران</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">محصولات</h4>
            <ul className="space-y-2">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">شرکت</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">پشتیبانی</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © ۱۴۰۴ دیجی‌اسکریپت. تمام حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-pink-400 hover:bg-pink-400/10 rounded-lg transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-sky-400 hover:bg-sky-400/10 rounded-lg transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <GitBranch className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
